/*
The PreviewListComponent. This displays under a user's activity and another user's activity.

On the leftmost side is the first 3 game covers, next to that is the title
Below that is the description

TierList and Lists are combined in this component
*/

import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	createTheme,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	Stack,
	ThemeProvider,
	Typography
} from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../firebase.config"
import { arrayRemove, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Delete, ThumbDown, ThumbUp, Comment } from "@mui/icons-material"
import { manageListVote, setListUpvoteSelection } from "../helperFunctions/listsUpvotes"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

/**
 * Shows the preview of a list or tierlist. When clicked, it will show the view page of such list.
 */
function PreviewListComponent(props) {
	const { currentUser } = auth
	const userID = currentUser.uid
	const navigate = useNavigate()

	const [upvotes, setUpvotes] = useState(props.upvotes.length)
	const [downvotes, setDownvotes] = useState(props.downvotes.length)
	const [upvote, setUpvote] = useState(false)
	const [downvote, setDownvote] = useState(false)
	const collection = props.type === "tierlist" ? "tierlists" : "lists"
	const [clickedDelete, setClickedDelete] = useState(false)
	// state and open and close handlers for Confirm Delete List
	const [openConfirmDeleteList, setOpenConfirmDeleteList] = useState(false)
	const [date, setDate] = useState(new Date(props.createdAt.seconds * 1000).toDateString())

	// handles upvoting or downvoting a list/tierlist
	useEffect(() => {
		setListUpvoteSelection(collection, userID, props.id, setUpvote, setDownvote)
	}, [])

	// handles opening the dialog to confirm deleting a list/tierlist
	const handleClickOpenConfirmDeleteList = () => {
		setOpenConfirmDeleteList(true)
	}

	// handles closing the dialog to confirm deleting a list/tierlist
	const handleCloseConfirmDeleteList = () => {
		setOpenConfirmDeleteList(false)
	}

	// handles deleting a list/tierlist
	const handleDeleteList = async () => {
		setOpenConfirmDeleteList(false)

		// disable the trash icon
		if (!clickedDelete) setClickedDelete(true)

		if (props.type === "tierlist") {
			// delete from tierlists
			await deleteDoc(doc(db, "tierlists", props.id))

			// delete from users
			const userRef = await doc(db, "users", props.userId)
			await updateDoc(userRef, { tierlists: arrayRemove(props.id) })
		} else {
			// delete from lists
			await deleteDoc(doc(db, "lists", props.id))

			// delete from users
			const userRef = await doc(db, "users", props.userId)
			await updateDoc(userRef, { lists: arrayRemove(props.id) })
		}

		// reload reviews to remove
		if (props.reloadLists) {
			props.reloadLists()
		}
	}

	return (
		<>
			<Dialog
				open={openConfirmDeleteList}
				onClose={handleCloseConfirmDeleteList}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				PaperProps={{
					style: {
						backgroundColor: "transparent",
						boxShadow: "none"
					}
				}}>
				<DialogTitle id="alert-dialog-title" sx={{ bgcolor: "#252525", color: "#FFF" }}>
					{"Delete List?"}
				</DialogTitle>
				<DialogContent sx={{ bgcolor: "#252525" }}>
					<DialogContentText id="alert-dialog-description" sx={{ color: "#FFF" }}>
						This will delete the list forever! Are you sure?
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ bgcolor: "#252525" }}>
					<Button onClick={handleCloseConfirmDeleteList} sx={{ color: "#FFF" }}>
						Cancel
					</Button>
					<Button onClick={handleDeleteList} sx={{ color: "#FFF" }}>
						Delete List
					</Button>
				</DialogActions>
			</Dialog>
			<Card
				className="card"
				sx={{
					boxShadow: "0px 0px 15px #0f0f0f",
					background: "linear-gradient(#2e2e2e, transparent)",
					color: "#fff",
					width: "auto",
					borderRadius: 3,
					mb: 4,
					mt: 1,
					mr: 2,
					ml: 2,
					maxWidth: 850
				}}>
				<CardContent>
					<Grid container rowSpacing={3}>
						{/* List Preview Covers */}
						<Grid item xs={12} md={3}>
							<Box
								sx={{
									borderRadius: 2,
									mr: 1,
									ml: -1,

									"&:hover": { cursor: "pointer", boxShadow: "0px 0px 15px #4C2F97" }
								}}
								onClick={() => {
									props.type === "tierlist"
										? navigate(`/${props.username}/tierlist/view/${props.id}`)
										: navigate(`/${props.username}/list/view/${props.id}`)
								}}>
								<Box
									component="img"
									width={90}
									sx={{
										backgroundColor: "#FFF",
										borderRadius: 2,
										boxShadow: "0px 0px 20px #000"
									}}
									src={props.preview[2]}></Box>
								<Box
									component="img"
									width={90}
									sx={{
										backgroundColor: "#FFF",
										borderRadius: 2,
										boxShadow: "0px 0px 20px #000",
										ml: 1
									}}
									src={props.preview[1]}></Box>
								<Box
									component="img"
									width={100}
									sx={{
										backgroundColor: "#FFF",
										borderRadius: 2,
										boxShadow: "0px 0px 20px #000",
										mt: -12
									}}
									src={props.preview[0]}></Box>
							</Box>
						</Grid>

						{/* Title, user info and review */}
						<Grid item xs={12} md={9} align={"left"}>
							<ThemeProvider theme={theme}>
								<Typography
									fontSize={"32px"}
									sx={{
										"&:hover": {
											textDecoration: "underline",
											cursor: "pointer"
										}
									}}
									onClick={() => {
										props.type === "tierlist"
											? navigate(`/${props.username}/tierlist/view/${props.id}`)
											: navigate(`/${props.username}/list/view/${props.id}`)
									}}>
									{props.title}
								</Typography>
							</ThemeProvider>
							<Stack direction="row" spacing={1}>
								{props.profilePic && (
									<Avatar
										alt="username"
										src={props.profilePic}
										sx={{
											height: 35,
											width: 35,
											mt: -0.75,
											"&:hover": { cursor: "pointer", boxShadow: "0px 0px 15px #4C2F97" }
										}}
										onClick={() => navigate(`/${props.username}`)}
									/>
								)}

								{props.name ? (
									<Typography fontSize={"14px"}>
										<span onClick={() => navigate(`/${props.username}`)} className="username-hover">
											{props.name}
										</span>{" "}
										{props.type === "tierlist" ? "published new Tier List" : "published new List"}
									</Typography>
								) : (
									<Typography fontSize={"14px"}>{props.type === "tierlist" ? "Tier List by " : "List by "}</Typography>
								)}
							</Stack>
							<Grid item xs={12} align="left" mt={1}>
								<Typography color="#a3a3a3" fontSize={"12px"}>
									Created at: {date}
								</Typography>
							</Grid>

							{/* Display description (3 lines) */}
							<ThemeProvider theme={theme}>
								<Typography
									mt={1}
									component={"span"}
									color="#fff"
									align={"left"}
									sx={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										display: "-webkit-box",
										WebkitLineClamp: "3",
										WebkitBoxOrient: "vertical",
										flexGrow: 1,
										height: "auto",
										maxHeight: 66,
										mb: 2
									}}>
									{props.description}
								</Typography>
							</ThemeProvider>

							<Grid container sx={{ mt: 2 }}>
								{/* Upvotes icon and value */}
								<Grid item md={1} xs={2} align="center">
									<Avatar
										sx={{
											bgcolor: upvote ? "#4C2F97" : "#A1A1A1",
											width: 30,
											height: 30
										}}>
										<Button
											sx={{}}
											onClick={() =>
												manageListVote(1, collection, userID, props.userId, props.id, setUpvote, setUpvotes, setDownvote, setDownvotes)
											}>
											<ThumbUp
												sx={{
													color: "#FFF",
													width: 18,
													height: 18
												}}
											/>
										</Button>
									</Avatar>
									<Typography mt={1}>{upvotes}</Typography>
								</Grid>

								{/* Downvotes icon and value */}
								<Grid item md={1} xs={2} align="center">
									<Avatar
										sx={{
											bgcolor: downvote ? "#BD170A" : "#A1A1A1",
											width: 30,
											height: 30
										}}>
										<Button
											onClick={() =>
												manageListVote(0, collection, userID, props.userId, props.id, setUpvote, setUpvotes, setDownvote, setDownvotes)
											}>
											<ThumbDown
												sx={{
													color: "#FFF",
													width: 18,
													height: 18
												}}
											/>
										</Button>
									</Avatar>
									<Typography mt={1}>{downvotes}</Typography>
								</Grid>

								{props.userId === userID ? (
									<>
										<Grid item md={1} xs={2} align="center">
											<Avatar
												sx={{
													width: 30,
													height: 30
												}}>
												<Button
													onClick={() => {
														props.type === "tierlist"
															? navigate(`/${props.username}/tierlist/view/${props.id}`)
															: navigate(`/${props.username}/list/view/${props.id}`)
													}}>
													<Comment
														sx={{
															color: "#FFF",
															width: 18,
															height: 18
														}}
													/>
												</Button>
											</Avatar>
											<Typography mt={1}>{props.comments && props.comments.length}</Typography>
										</Grid>
										<Grid item md={1} xs={2} align="center">
											<Avatar
												sx={{
													bgcolor: "#BD170A",
													width: 30,
													height: 30
												}}>
												<Button onClick={handleClickOpenConfirmDeleteList} disabled={clickedDelete}>
													<Delete
														sx={{
															color: "#FFF",
															width: 18,
															height: 18
														}}
													/>
												</Button>
											</Avatar>
										</Grid>
									</>
								) : (
									<>
										<Grid item md={1} xs={2} align="center">
											<Avatar
												sx={{
													width: 30,
													height: 30
												}}>
												<Button
													onClick={() => {
														props.type === "tierlist"
															? navigate(`/${props.username}/tierlist/view/${props.id}`)
															: navigate(`/${props.username}/list/view/${props.id}`)
													}}>
													<Comment
														sx={{
															color: "#fff",
															width: 18,
															height: 18
														}}
													/>
												</Button>
											</Avatar>
											<Typography mt={1}>{props.comments && props.comments.length}</Typography>
										</Grid>
									</>
								)}
							</Grid>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</>
	)
}

export default PreviewListComponent
