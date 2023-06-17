/*
The CommentComponent. This displays wherever a user can leave a comment
*/

import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	createTheme,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	Grid,
	Stack,
	TextField,
	ThemeProvider,
	Typography
} from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../firebase.config"
import { arrayRemove, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { Delete, Edit, ThumbDown, ThumbUp } from "@mui/icons-material"
import { manageCommentVote, setCommentUpvoteSelection } from "../helperFunctions/commentsUpvotes"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function CommentComponent(props) {
	const { currentUser } = auth
	const userID = currentUser.uid

	const navigate = useNavigate()

	const [upvotes, setUpvotes] = useState(props.upvotes.length)
	const [downvotes, setDownvotes] = useState(props.downvotes.length)
	const [upvote, setUpvote] = useState(false)
	const [downvote, setDownvote] = useState(false)

	const [clickedDelete, setClickedDelete] = useState(false)
	const [clickedEdit, setClickedEdit] = useState(false)

	const [comment, setComment] = useState(props.comment)
	const [containsSpoiler, setContainsSpoiler] = useState(props.containsSpoiler)
	const [showSpoiler, setShowSpoiler] = useState(userID === props.userId)

	const [date, setDate] = useState(new Date(props.createdAt.seconds * 1000).toDateString())

	useEffect(() => {
		setCommentUpvoteSelection("comments", userID, props.id, setUpvote, setDownvote)
	}, [])

	// state and open and close handlers for Confirm Delete List
	const [openConfirmDeleteComment, setOpenConfirmDeleteComment] = useState(false)

	const handleClickOpenConfirmDeleteComment = () => {
		setOpenConfirmDeleteComment(true)
	}

	const handleCloseConfirmDeleteComment = () => {
		setOpenConfirmDeleteComment(false)
	}

	// state and open and close handlers for Confirm Edit List
	const [openConfirmEditComment, setOpenConfirmEditComment] = useState(false)

	// opens edit dialog
	const handleClickOpenConfirmEditComment = () => {
		setOpenConfirmEditComment(true)
	}

	// closes edit dialog
	const handleCloseConfirmEditComment = () => {
		setOpenConfirmEditComment(false)
	}

	// sets state for the comment text
	const handleDialogTextChange = (e) => {
		setComment(e.target.value)
	}

	// edits the comment in the db
	const handleEditComment = async () => {
		setOpenConfirmEditComment(false)

		// disable the edit icon
		if (!clickedEdit) setClickedEdit(true)

		// update from comments
		await updateDoc(doc(db, "comments", props.id), {
			comment: comment,
			containsSpoiler: containsSpoiler
		})

		// reload page to remove
		if (props.reloadPage) {
			props.reloadPage()
		}

		setClickedEdit(false)
	}

	// deletes the comment from the db
	const handleDeleteComment = async () => {
		setOpenConfirmDeleteComment(false)

		// disable the trash icon
		if (!clickedDelete) setClickedDelete(true)

		// delete from comments
		await deleteDoc(doc(db, "comments", props.id))

		// delete from users
		const userRef = await doc(db, "users", props.userId)
		await updateDoc(userRef, { comments: arrayRemove(props.id) })

		// delete from type
		if (props.parentType === "tierlist") {
			const tierlistRef = await doc(db, "tierlists", props.parentId)
			await updateDoc(tierlistRef, { comments: arrayRemove(props.id) })
		} else if (props.parentType === "list") {
			const listRef = await doc(db, "lists", props.parentId)
			await updateDoc(listRef, { comments: arrayRemove(props.id) })
		} else {
			const reviewsRef = await doc(db, "reviews", props.parentId)
			await updateDoc(reviewsRef, { comments: arrayRemove(props.id) })
		}

		// reload page to remove
		if (props.reloadPage) {
			props.reloadPage()
		}
	}

	// sets state for the comment containing a spoiler
	const handleContainsSpoilerChange = () => {
		if (containsSpoiler) setContainsSpoiler(false)
		else setContainsSpoiler(true)
	}

	// sets state to show a comment that contains a spoiler
	const revealSpoiler = () => {
		setShowSpoiler(true)
	}

	// jsx for obscuring a comment if it contains spoilers
	function ObscureComment() {
		return (
			<Box>
				<ThemeProvider theme={theme}>
					<Typography
						align={"center"}
						mt={3}
						mb={3}
						component={"span"}
						color="#fff"
						sx={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							display: "-webkit-box",
							WebkitLineClamp: "3",
							WebkitBoxOrient: "vertical",
							flexGrow: 1,
							height: "auto",
							maxHeight: 66
						}}>
						This comment contains spoilers!
					</Typography>
				</ThemeProvider>
				<Button
					onClick={revealSpoiler}
					align={"center"}
					sx={{
						background: "linear-gradient(#4f319b,#362269)",
						textTransform: "none",
						color: "#FFF",
						mb: 4,
						"&:hover": { boxShadow: "0px 0px 15px #4C2F97" }
					}}>
					<ThemeProvider theme={theme}>
						<Typography align={"center"} component={"span"} color="#fff">
							Show me anyway
						</Typography>
					</ThemeProvider>
				</Button>
			</Box>
		)
	}

	// jsx for displaying "confirm delete" dialog
	function DeleteDialog() {
		return (
			<Dialog
				open={openConfirmDeleteComment}
				onClose={handleCloseConfirmDeleteComment}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				PaperProps={{
					style: {
						backgroundColor: "transparent",
						boxShadow: "none"
					}
				}}>
				<DialogTitle id="alert-dialog-title" sx={{ bgcolor: "#252525", color: "#FFF" }}>
					{"Delete Comment?"}
				</DialogTitle>
				<DialogContent sx={{ bgcolor: "#252525" }}>
					<DialogContentText id="alert-dialog-description" sx={{ color: "#FFF" }}>
						This will delete the comment forever! Are you sure?
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ bgcolor: "#252525" }}>
					<Button onClick={handleCloseConfirmDeleteComment} sx={{ color: "#FFF" }}>
						Cancel
					</Button>
					<Button onClick={handleDeleteComment} sx={{ color: "#FFF" }}>
						Delete Comment
					</Button>
				</DialogActions>
			</Dialog>
		)
	}

	return (
		<>
			{containsSpoiler && !showSpoiler ? (
				<>
					<Grid item xs={12} align={"center"}>
						<Card
							className="card"
							sx={{
								bgcolor: "#252525",
								color: "#fff",
								width: "auto",
								borderRadius: 3,
								mb: 5,
								maxWidth: 800
							}}>
							<ObscureComment gameTitle={props.gameTitle} gameReleaseDate={props.gameReleaseDate} />
						</Card>
					</Grid>
				</>
			) : (
				<>
					<DeleteDialog></DeleteDialog>

					{/* Edit dialog */}
					<Dialog
						open={openConfirmEditComment}
						onClose={handleCloseConfirmEditComment}
						aria-labelledby="alert-dialog-title"
						aria-describedby="alert-dialog-description"
						PaperProps={{
							style: {
								backgroundColor: "transparent",
								boxShadow: "none"
							}
						}}>
						<DialogTitle id="alert-dialog-title" sx={{ bgcolor: "#252525", color: "#FFF" }}>
							{"Edit Comment"}
						</DialogTitle>
						<DialogContent sx={{ bgcolor: "#252525" }}>
							<TextField
								fullWidth
								id="fullWidth"
								variant="outlined"
								multiline
								rows={5}
								value={comment}
								inputProps={{ style: { color: "#FFF" } }}
								sx={{
									color: "white",
									".MuiOutlinedInput-notchedOutline": {
										borderColor: "#FFF"
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: "#FFF"
									},
									"&:hover .MuiOutlinedInput-notchedOutline": {
										borderColor: "#FFF"
									}
								}}
								onChange={handleDialogTextChange}
							/>

							{/* Contains Spoilers  entry */}
							<FormControlLabel
								sx={{ color: "#FFF" }}
								label="Contains Spoilers"
								labelPlacement="start"
								control={
									<Checkbox
										checked={containsSpoiler}
										value="remember"
										sx={{
											color: "#FFF",
											"&.Mui-checked": {
												color: "#4C2F97"
											}
										}}
										onChange={handleContainsSpoilerChange}
									/>
								}
							/>
						</DialogContent>
						<DialogActions sx={{ bgcolor: "#252525" }}>
							<Button onClick={handleCloseConfirmEditComment} sx={{ color: "#FFF" }}>
								Cancel
							</Button>
							<Button onClick={handleEditComment} sx={{ color: "#FFF" }}>
								Edit Comment
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
							maxWidth: 850
						}}>
						<CardContent>
							<Grid container rowSpacing={3}>
								{/* profile pic */}
								<Grid item sm={1.5} xs={3} align={"left"}>
									<Avatar
										alt="username"
										src={props.profilePic}
										sx={{
											height: { md: 70, xs: 55 },
											width: { md: 70, xs: 55 },
											"&:hover": { cursor: "pointer", boxShadow: "0px 0px 15px #4C2F97" }
										}}
										onClick={() => navigate(`/${props.username}`)}
									/>
								</Grid>

								{/* User info and comment */}
								<Grid item sm={10} xs={9} align={"left"}>
									<Stack direction="row" spacing={1}>
										<Typography fontSize={"14px"}>
											<span onClick={() => navigate(`/${props.username}`)} className="username-hover">
												{props.name}
											</span>{" "}
											wrote a comment
										</Typography>
									</Stack>
									<Typography fontSize={"13px"}>
										<span onClick={() => navigate(`/${props.username}`)} className="username-hover">
											@{props.username}
										</span>
									</Typography>
									<Grid item xs={12} align="left">
										<Typography color="#a3a3a3" fontSize={"12px"} >
											Created at: {date}
										</Typography>
									</Grid>

									<ThemeProvider theme={theme}>
										<Typography
											mt={1}
											component={"span"}
											color="#fff"
											align={"left"}
											sx={{
												overflow: "auto",
												textOverflow: "ellipsis",
												display: "-webkit-box",
												WebkitLineClamp: "4",
												WebkitBoxOrient: "vertical",
												flexGrow: 1,
												height: "auto",
												maxHeight: 90
											}}>
											{props.comment}
										</Typography>
									</ThemeProvider>
								</Grid>

								{/* Upvotes icon and value */}
								<Grid item sm={1.75} xs={2} align="left">
									<Avatar sx={{ mt: -1.25, bgcolor: upvote ? "#4C2F97" : "#A1A1A1" }}>
										<Button
											sx={{}}
											onClick={() =>
												manageCommentVote(
													1,
													"comments",
													userID,
													props.userId,
													props.id,
													setUpvote,
													setUpvotes,
													setDownvote,
													setDownvotes,
													props.gameData,
													props.listData
												)
											}>
											<ThumbUp sx={{ color: "#FFF" }} />
										</Button>
									</Avatar>
									<Typography ml={2}>{upvotes}</Typography>
								</Grid>

								{/* Downvotes icon and value */}
								<Grid item sm={2} xs={2} align="left">
									<Avatar
										sx={{
											bgcolor: downvote ? "#BD170A" : "#A1A1A1",
											mt: -1.25
										}}>
										<Button
											onClick={() =>
												manageCommentVote(
													0,
													"comments",
													userID,
													props.userId,
													props.id,
													setUpvote,
													setUpvotes,
													setDownvote,
													setDownvotes
												)
											}>
											<ThumbDown sx={{ color: "#FFF" }} />
										</Button>
									</Avatar>
									<Typography ml={2}>{downvotes}</Typography>
								</Grid>

								{/* delete icon if the comment belongs to current user */}
								{props.userId === userID ? (
									<>
										<Grid item sm={7.25} xs={6} align="right">
											<Avatar sx={{ bgcolor: "#A1A1A1" }}>
												<Button onClick={handleClickOpenConfirmEditComment}>
													<Edit sx={{ color: "#4C2F97" }} disabled={clickedEdit} />
												</Button>
											</Avatar>
										</Grid>
										<Grid item sm={1} xs={2} align="right">
											<Avatar sx={{ bgcolor: "#BD170A" }}>
												<Button onClick={handleClickOpenConfirmDeleteComment} disabled={clickedDelete}>
													<Delete sx={{ color: "#FFF" }} />
												</Button>
											</Avatar>
										</Grid>
									</>
								) : (
									""
								)}

							</Grid>
						</CardContent>
					</Card>
				</>
			)}
		</>
	)
}

export default CommentComponent
