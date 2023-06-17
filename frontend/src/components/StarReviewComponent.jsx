/*
The StarReviewComponent. This displays under a user's reviews and another user's recent reviews. This is one of the variants of what 
reviews will look like. This component is structured like so:

On the leftmost side is the gamecover, next to that is the title and year 
Below that is their star rating

This only displays when a user submits a review with no text
*/

import {
	Avatar,
	Box,
	Button,
	createTheme,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	Rating,
	ThemeProvider,
	Typography
} from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../firebase.config"
import { arrayRemove, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { Delete } from "@mui/icons-material"
import { computeNewRating } from "../helperFunctions/computeNewRatingFunction"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function StarReviewComponent(props) {
	const { currentUser } = auth
	const userID = currentUser.uid

	const navigate = useNavigate()

	const navigateToGamePage = (gameId) => {
		navigate("/game/" + gameId)
	}

	const [clickedDelete, setClickedDelete] = useState(false)

	const [date, setDate] = useState(new Date(props.createdAt.seconds * 1000).toDateString())

	// state and open and close handlers for Confirm Delete Review
	const [openConfirmDeleteReview, setOpenConfirmDeleteReview] = useState(false)

	const handleClickOpenConfirmDeleteReview = () => {
		setOpenConfirmDeleteReview(true)
	}

	const handleCloseConfirmDeleteReview = () => {
		setOpenConfirmDeleteReview(false)
	}

	const handleDeleteReview = async () => {
		setOpenConfirmDeleteReview(false)

		// disable the trash icon
		if (!clickedDelete) setClickedDelete(true)

		// delete from reviews
		await deleteDoc(doc(db, "reviews", props.id))

		// delete from users
		const userRef = await doc(db, "users", props.userId)
		await updateDoc(userRef, { reviews: arrayRemove(props.id) })

		// delete from gameSpecificReviews
		const gameSpecificReviewsRef = await doc(db, "gameSpecificReviews", props.gameId)
		await updateDoc(gameSpecificReviewsRef, { reviews: arrayRemove(props.id) })

		// delete the document if there's no more reviews contained within that gameId
		const gameSpecificReviewsDocSnap = await getDoc(doc(db, "gameSpecificReviews", props.gameId))
		if (gameSpecificReviewsDocSnap.data().reviews.length === 0) {
			await deleteDoc(gameSpecificReviewsRef)
		} else computeNewRating(props.gameId)

		// reload reviews to remove
		if (props.reloadReviews) {
			props.reloadReviews()
		}
	}

	return (
		<>
			<Grid container sx={{
				boxShadow: "0px 0px 15px #0f0f0f",
				background: "linear-gradient(#2e2e2e, transparent)",
				color: "#fff",
				width: "auto",
				borderRadius: 2,
				mb: 2,
				mt: 1,
				mr: 2,
				ml: 2,
				maxWidth: 850,
				minWidth: 290
			}}>
				<Grid item xs={12}>
					<Dialog
						open={openConfirmDeleteReview}
						onClose={handleCloseConfirmDeleteReview}
						aria-labelledby="alert-dialog-title"
						aria-describedby="alert-dialog-description"
						PaperProps={{
							style: {
								backgroundColor: "transparent",
								boxShadow: "none"
							}
						}}
					>
						<DialogTitle id="alert-dialog-title" sx={{ bgcolor: "#252525", color: "#FFF" }}>
							{"Delete Review?"}
						</DialogTitle>
						<DialogContent sx={{ bgcolor: "#252525" }}>
							<DialogContentText id="alert-dialog-description" sx={{ color: "#FFF" }}>
								This will delete the review forever! Are you sure?
							</DialogContentText>
						</DialogContent>
						<DialogActions sx={{ bgcolor: "#252525" }}>
							<Button onClick={handleCloseConfirmDeleteReview} sx={{ color: "#FFF" }}>
								Cancel
							</Button>
							<Button onClick={handleDeleteReview} sx={{ color: "#FFF" }}>
								Delete Review
							</Button>
						</DialogActions>
					</Dialog>

				</Grid>
				{/* Game Cover */}
				<Grid item md={2} xs={12}>
					<Box
						component="img"
						width={120}
						sx={{
							backgroundColor: "#FFF",
							borderRadius: 3,
							mr: 1,
							mt: 2,
							mb: 1,
							ml: 1,
							"&:hover": { cursor: "pointer", boxShadow: "0px 0px 15px #4C2F97" }
						}}
						src={props.gameCover}
						onClick={() => navigateToGamePage(props.gameId)}></Box>

				</Grid>

				{/* Title, user info and review */}
				<Grid item xs={9} align={"left"} ml={1} mt={1}>
					<ThemeProvider theme={theme}>
						<Typography
							fontSize={"32px"}
							sx={{ "&:hover": { textDecoration: "underline", cursor: "pointer" } }}
							onClick={() => navigateToGamePage(props.gameId)}>
							{props.gameTitle} ({props.gameReleaseDate})
						</Typography>
					</ThemeProvider>

					<Grid item xs={12} align={"left"}>
						<Grid container>
							{/* Profile pic */}
							{props.profilePic ? (
								<Grid item md={1} xs={2} align={"left"} sx={{ mt: 1, ml: 1 }}>
									<Avatar alt="username" src={props.profilePic} sx={{
										height: 40, width: 40,
										"&:hover": { cursor: "pointer", boxShadow: "0px 0px 15px #4C2F97" }
									}} onClick={() => navigate(`/${props.username}`)} />
								</Grid>)
								:
								<></>
							}
							<Grid item md={7} xs={6} align={"left"} sx={{ mt: 1, ml: 1 }}>


								{props.name ? (
									<Typography fontSize={"15px"} onClick={() => navigate(`/${props.username}`)} sx={{ "&:hover": { cursor: "pointer", textDecoration: "underline" } }}>
										@{props.username}
									</Typography>)
									:
									<></>
								}

								<Grid container>
									<Grid item
										xs={props.name ? 8 : 8}
										sm={props.name ? 4 : 4}
										md={props.name ? 2.25 : 2.5}
										align="left">
										<Typography fontSize={"15px"}>
											{props.rating} {props.rating === 1 ? "Star" : "Stars"}
										</Typography>
									</Grid>
									<Grid
										item xs={props.name ? 4 : 4}
										sm={props.name ? 8 : 8}
										md={props.name ? 9.25 : 9.5}
										align="left">
										<Rating
											value={props.rating ? props.rating : 0}
											size="small"
											precision={0.5}
											sx={{
												ml: props.name ? ((props.rating % 1) === 0 ? -2 : 0) : ((props.rating % 1) === 0 ? -2 : -1),
												mt: 0.15,
												"& .MuiRating-iconFilled": {
													color: "#7952de"
												},
												"& .MuiRating-iconEmpty": {
													color: "#7952de"
												}
											}}
											readOnly
										/>
									</Grid>
								</Grid>

							</Grid>
							<Grid item md={7} xs={11} align={"left"} sx={{ mt: 1, ml: 1, mb: 1 }}>
								<Typography color="#a3a3a3" fontSize={"12px"}> Created at:   {date} </Typography>

							</Grid>
							{props.userId === userID ? (
								<Grid item xs={.5} md={12} mb={1} ml={1} sx={{ align: { md: "left", xs: "right" } }}>
									<Avatar sx={{
										bgcolor: "#BD170A", width: 30,
										height: 30
									}}>
										<Button onClick={handleClickOpenConfirmDeleteReview} disabled={clickedDelete}>
											<Delete sx={{
												color: "#FFF",
												width: 18,
												height: 18
											}} />
										</Button>
									</Avatar>
								</Grid>
							) : (
								""
							)}
						</Grid></Grid>
				</Grid>
			</Grid>
		</>
	)
}

export default StarReviewComponent