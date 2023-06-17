/*
The View List Page. This shows a non-editable version of a created list object
that anyone can view.

This page is loaded and shown when a user publishes/updates a list or clicks on a list preview component.
*/
import {
	Avatar,
	Card,
	CardContent,
	createTheme,
	Grid,
	ThemeProvider,
	Typography,
	Tooltip,
	Zoom,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
	TextField,
	FormControlLabel,
	Checkbox,
	Divider
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { arrayRemove, deleteDoc, doc, getDoc, updateDoc, collection, setDoc, serverTimestamp, arrayUnion, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "../../firebase.config"
import Box from "@mui/material/Box"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../../components/NavbarComponent"
import SideNav from "../../components/SideNavComponent"
import Footer from "../../components/FooterComponent"
import CommentComponent from "../../components/CommentComponent"
import Spinner from "../../components/Spinner"
import { Delete, Edit, SentimentVeryDissatisfied, ThumbDown, ThumbUp } from "@mui/icons-material"
import { manageListVote } from "../../helperFunctions/listsUpvotes"
import { uuidv4 } from "@firebase/util"
import SpinnerComponent from "../../components/SpinnerComponent"
import { commentNotification } from "../../helperFunctions/commentNotifications"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans",
		fontSize: 20
	}
})

function ViewListPage() {
	const { currentUser } = auth
	const userID = currentUser.uid

	const { username, listID } = useParams()
	const navigate = useNavigate()

	const [list, setList] = useState(null)
	const [user, setUser] = useState(null)

	const [showEditDelete, setShowEditDelete] = useState(null)
	const [clickedDelete, setClickedDelete] = useState(false)

	// state and open and close handlers for Confirm Delete List
	const [openConfirmDeleteList, setOpenConfirmDeleteList] = useState(false)

	const [upvotes, setUpvotes] = useState(0)
	const [downvotes, setDownvotes] = useState(0)
	const [upvote, setUpvote] = useState(false)
	const [downvote, setDownvote] = useState(false)

	const [comment, setComment] = useState("")
	const [disableSubmit, setDisableSubmit] = useState(false)
	const [containsSpoiler, setContainsSpoiler] = useState(false)

	const [commentIds, setCommentIds] = useState(null)
	const [comments, setComments] = useState(null)
	const [commentsToShow, setCommentsToShow] = useState(null)

	// gets list object
	useEffect(() => {
		getList()
	}, [listID])

	// gets comments for list
	useEffect(() => {
		const getCommentData = async () => {
			let tempArr = []

			if (commentIds.length !== 0) {
				for (let i = 0; i < commentIds.length; i++) {
					let commentsDocRef = doc(db, "comments", commentIds[i].toString())
					let commentSnap = await getDoc(commentsDocRef)

					let userInfoDocRef = null
					if (commentSnap.data()) {
						userInfoDocRef = doc(db, "users", commentSnap.data().userId)
						const userInfoSnap = await getDoc(userInfoDocRef)

						tempArr.push({
							id: commentSnap.id,
							createdAt: commentSnap.data().createdAt,
							comment: commentSnap.data().comment,
							containsSpoiler: commentSnap.data().containsSpoiler,
							downvotes: commentSnap.data().downvotes,
							upvotes: commentSnap.data().upvotes,
							userId: commentSnap.data().userId,
							parentType: commentSnap.data().parentType,
							profilePic: userInfoSnap.get("profilePic"),
							username: userInfoSnap.get("username"),
							name: userInfoSnap.get("name")
						})
					}
				}

				setCommentsToShow(true)
			} else {
				setCommentsToShow(false)
			}

			tempArr.sort((a, b) => b.createdAt - a.createdAt)

			setComments(tempArr)
		}
		if (commentIds) getCommentData()
	}, [commentIds])

	// gets list object
	async function getList() {
		setList(null)

		const usersRef = collection(db, "users")
		const q = query(usersRef, where("username", "==", username))
		const userSnapshot = await getDocs(q)
		// check if user exists and if this list was created by them
		if (userSnapshot.empty) navigate("/notfound")
		if (!userSnapshot.docs[0].data().lists.includes(listID)) navigate("/notfound")

		const listDocRef = doc(db, "lists", listID)
		const listDocSnap = await getDoc(listDocRef)
		if (listDocSnap.empty) navigate("/notfound")

		setList(listDocSnap)
		const upvotesArray = listDocSnap.data().upvotes
		const downvotesArray = listDocSnap.data().downvotes
		setUpvotes(upvotesArray.length)
		setDownvotes(downvotesArray.length)

		setCommentIds(listDocSnap.data().comments)

		if (upvotesArray) {
			if (upvotesArray.includes(userID)) {
				setUpvote(true)
				setDownvote(false)
			} else if (downvotesArray.includes(userID)) {
				setUpvote(false)
				setDownvote(true)
			} else {
				setUpvote(false)
				setDownvote(false)
			}
		}

		const usersDocRef = doc(db, "users", listDocSnap.data().userId)
		const userDocSnap = await getDoc(usersDocRef)

		if (listDocSnap.data().userId === userID) setShowEditDelete(true)
		else setShowEditDelete(false)

		setUser(userDocSnap)
	}

	// sets state for the comment text
	const handleCommentTextChange = (e) => {
		setComment(e.target.value)
	}

	// sets state for the comment containing a spoiler
	const handleContainsSpoilerChange = () => {
		if (containsSpoiler) setContainsSpoiler(false)
		else setContainsSpoiler(true)
	}

	const handleClickOpenConfirmDeleteList = () => {
		setOpenConfirmDeleteList(true)
	}

	const handleCloseConfirmDeleteList = () => {
		setOpenConfirmDeleteList(false)
	}

	const handleDeleteList = async () => {
		setOpenConfirmDeleteList(false)

		// disable the trash icon
		if (!clickedDelete) setClickedDelete(true)

		// delete from lists
		await deleteDoc(doc(db, "lists", listID))

		// delete from users
		const userRef = await doc(db, "users", user.id)
		await updateDoc(userRef, { lists: arrayRemove(listID) })

		navigate(`/${user.data().username}`)
	}

	// adds a comment to the db
	const createComment = async () => {
		if (comment) {
			setDisableSubmit(true)

			const commentID = uuidv4()
			await setDoc(doc(db, "comments", commentID), {
				userId: currentUser.uid,
				comment: comment,
				containsSpoiler: containsSpoiler,
				createdAt: serverTimestamp(),
				upvotes: [],
				downvotes: [],
				replies: [],
				parentType: "list"
			})

			// Add comment to user's list of comments
			const userRef = await doc(db, "users", userID)
			await updateDoc(userRef, {
				comments: arrayUnion(commentID)
			})

			// Add comment to list obj
			await updateDoc(doc(db, "lists", listID), {
				comments: arrayUnion(commentID)
			})

			await commentNotification(
				userID,
				list.data().userId,
				{ id: listID, name: list.data().name, collection: "lists", ownerID: list.data().userId },
				null
			)

			setComment("")
			setDisableSubmit(false)
			setContainsSpoiler(false)

			const listDocRef = doc(db, "lists", listID)
			const listDocSnap = await getDoc(listDocRef)
			setCommentIds(listDocSnap.data().comments)
		}
	}

	// jsx for displaying the list UI
	function ShowList() {
		const rows = []

		let items = list.data().list[0].items
		for (let i = 0; i < items.length; i++) {
			rows.push(
				<Grid item key={i} xs={3} sm={2} md={2} ml={-0.5}>
					<Tooltip
						title={
							<React.Fragment>
								<Typography color="inherit">
									{items[i].title} ({items[i].year})
								</Typography>
							</React.Fragment>
						}
						placement="bottom"
						arrow
						TransitionComponent={Zoom}>
						<Box
							component="img"
							mt={3}
							sx={{
								backgroundColor: "#fff",
								borderRadius: 2,
								"&:hover": { cursor: "pointer", boxShadow: "0px 0px 13px #4C2F97" },
								width: { xs: 70, md: 95 },
								height: { xs: 90, md: 135 }
							}}
							onClick={() => navigate(`/game/${items[i].gameID}`)}
							src={items[i].cover}></Box>
					</Tooltip>
				</Grid>
			)
		}

		return (
			<>
				{/* sliced because we don't want to see the Bank */}
				{rows}
			</>
		)
	}

	// JSX for showing all comments. appends to a list in html format
	function ShowAllComments() {
		// if there are comments to show, show a spinner until all comments are populated
		if (commentsToShow) {
			// if there's any comments to show
			if (comments.length !== 0) {
				const rows = []
				for (let i = 0; i < comments.length; i++) {
					rows.push(
						<CommentComponent
							key={i}
							id={comments[i].id}
							upvotes={comments[i].upvotes}
							downvotes={comments[i].downvotes}
							comment={comments[i].comment}
							userId={comments[i].userId}
							profilePic={comments[i].profilePic}
							username={comments[i].username}
							name={comments[i].name}
							parentType={comments[i].parentType}
							parentId={listID}
							reloadPage={getList}
							containsSpoiler={comments[i].containsSpoiler}
							createdAt={comments[i].createdAt}
							listData={{ id: listID, name: list.data().name, collection: "lists", ownerID: list.data().userId }}
						/>
					)
				}
				return <>{rows.length !== 0 ? rows : <NoCommentsJSX />}</>
			} else {
				return (
					<Card className="card" sx={{ bgcolor: "#252525", color: "#ffffff", width: "auto", borderRadius: 3, mb: 5, maxWidth: 915 }}>
						<CardContent>
							<SpinnerComponent override={{ position: "relative", margin: "50px" }} />
						</CardContent>
					</Card>
				)
			}
		}

		// otherwise there's no reviews to show at all, so say there's no reviews to display
		// along with a frowny face :(
		else
			return (
				<>
					<NoCommentsJSX />
				</>
			)
	}

	const NoCommentsJSX = () => {
		return (
			<Card className="card" sx={{ bgcolor: "#252525", color: "#fff", width: "auto", borderRadius: 3, mb: 5, maxWidth: 800 }}>
				<CardContent>
					<SentimentVeryDissatisfied fontSize="large" />

					<ThemeProvider theme={theme}>
						<Typography>No Comments to Display</Typography>
					</ThemeProvider>
				</CardContent>
			</Card>
		)
	}

	// if the data isn't loaded completely
	if (!list || !user) return <Spinner />
	return (
		<>
			<div className="content-wrapper">
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

				<Navbar />
				<SideNav />

				<Grid container sx={{ width: "auto", mb: 3, mt: 3, mr: 2, ml: 1 }}>
					<Grid item xs={12} align={"center"}>
						<Grid
							className="box"
							container
							rowSpacing={1}
							columnSpacing={2}
							sx={{ width: { xs: 1, md: 800, lg: 900 }, mb: 3, mr: 2, ml: 1, borderRadius: 2 }}>
							<Grid item xs={12}>
								<ThemeProvider theme={theme}>
									<Typography variant="h5" fontSize={"32px"} sx={{ flexGrow: 1 }}>
										List - {list.data().name}
									</Typography>
								</ThemeProvider>
							</Grid>

							<Grid item md={6} xs={12}>
								<Grid container>
									<Grid item xs={3}>
										<Typography fontSize={"16px"} color="#FFF" sx={{ flexGrow: 1 }}>
											Created By:
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Grid container align="center">
											<Grid item md={1} sx={{ mr: { xs: 1, md: 3 } }}>
												{user && (
													<Avatar
														alt="username"
														src={user.data().profilePic}
														sx={{
															height: 35,
															width: 35,
															"&:hover": { cursor: "pointer", boxShadow: "0px 0px 13px #4C2F97" },
															mt: -1,
															ml: 1
														}}
														onClick={() => navigate(`/${user.data().username}`)}></Avatar>
												)}
											</Grid>
											<Grid item xs={6}>
												<Typography fontSize={"16px"} color="#FFF" sx={{ flexGrow: 1 }}>
													<span onClick={() => navigate(`/${user.data().username}`)} className="username-hover">
														@{user && user.data().username}
													</span>{" "}
												</Typography>
											</Grid>
										</Grid>
									</Grid>
									<Grid item xs={12} align="left" mt={1} ml={1}>
										<Typography color="#a3a3a3" fontSize={"12px"}>
											Created at: {new Date(list.data().createdAt.seconds * 1000).toDateString()}{" "}
										</Typography>
									</Grid>
								</Grid>
							</Grid>

							<Grid item xs={12} align="left" mt={3}>
								<ThemeProvider theme={theme}>
									<Typography
										fontSize={"18px"}
										color="#FFF"
										sx={{
											flexGrow: 1,
											overflowY: "auto",
											overflowX: "hidden",
											display: "-webkit-box",
											WebkitLineClamp: "5",
											WebkitBoxOrient: "vertical",
											flexGrow: 1,
											height: "auto",
											ml: 1,
											mr: 2
										}}>
										{list.data().listDescription}
									</Typography>
								</ThemeProvider>
							</Grid>

							{showEditDelete && user ? (
								<>
									<Grid item md={10} xs={8}></Grid>
									<Grid item md={1} xs={2} ml={-1}>
										<Avatar sx={{ bgcolor: "#A1A1A1" }}>
											<Button onClick={() => navigate(`/${user.data().username}/list/edit/${listID}`)} disabled={clickedDelete}>
												<Edit sx={{ color: "#4C2F97" }} />
											</Button>
										</Avatar>
									</Grid>

									<Grid item md={1} xs={2} ml={-1}>
										<Avatar sx={{ bgcolor: "#BD170A" }}>
											<Button onClick={handleClickOpenConfirmDeleteList} disabled={clickedDelete}>
												<Delete sx={{ color: "#FFF" }} />
											</Button>
										</Avatar>
									</Grid>
								</>
							) : (
								""
							)}

							<Grid item xs={12}>
								<Grid container>
									<ShowList />
								</Grid>
							</Grid>

							<Grid item xs={12}>
								<Divider sx={{ borderBottomWidth: 2, mt: 2, mr: 1, ml: 1, mb: 1, bgcolor: "#a3a3a3" }} />
							</Grid>

							<Grid item xs={12} align="left">
								<Grid container>
									<Grid item md={9} xs={7} align="left" mt={3}>
										<ThemeProvider theme={theme}>
											<Typography fontSize={"32px"} color="#FFF" sx={{ flexGrow: 1 }}>
												Comments
											</Typography>
										</ThemeProvider>
									</Grid>

									{/* Upvotes icon and value */}
									<Grid item md={1.5} xs={2} mt={4} align="center">
										<Avatar sx={{ bgcolor: upvote ? "#4C2F97" : "#A1A1A1" }}>
											<Button
												onClick={() =>
													manageListVote(1, "lists", userID, user.id, listID, setUpvote, setUpvotes, setDownvote, setDownvotes)
												}>
												<ThumbUp sx={{ color: "#FFF" }} />
											</Button>
										</Avatar>

										<Typography color="#FFF">{upvotes}</Typography>
									</Grid>

									{/* Downvotes icon and value */}
									<Grid item xs={2} md={1.5} mt={4} align="center">
										<Avatar
											sx={{
												bgcolor: downvote ? "#BD170A" : "#A1A1A1"
											}}>
											<Button
												onClick={() =>
													manageListVote(0, "lists", userID, user.id, listID, setUpvote, setUpvotes, setDownvote, setDownvotes)
												}>
												<ThumbDown sx={{ color: "#FFF" }} />
											</Button>
										</Avatar>

										<Typography color="#FFF">{downvotes}</Typography>
									</Grid>
								</Grid>
							</Grid>

							<Grid item xs={12} align="left" mt={3}>
								<Typography fontSize={"16px"} color="#FFF" sx={{ flexGrow: 1 }}>
									Write a Comment:
								</Typography>
							</Grid>

							<Grid item xs={12} mr={2} align="center">
								<TextField
									fullWidth
									id="fullWidth"
									variant="outlined"
									multiline
									rows={2}
									value={comment}
									inputProps={{ style: { color: "#000" } }}
									sx={{
										"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
											borderColor: "#FFF"
										},
										"&:hover": { cursor: "pointer", boxShadow: "0px 0px 13px #4C2F97" },
										backgroundColor: "#555"
									}}
									onChange={handleCommentTextChange}
								/>
							</Grid>

							<Grid item md={9} xs={12} align="right" mr={1}>
								{/* Contains Spoilers  entry */}
								<FormControlLabel
									sx={{ mt: -0.5, color: "#FFF" }}
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
							</Grid>

							<Grid item xs={12} md={2} align="right" mr={1}>
								<Button
									onClick={createComment}
									disabled={disableSubmit}
									sx={{
										background: "linear-gradient(#4f319b,#362269)",
										borderRadius: 2,
										textTransform: "none"
									}}
									variant="contained">
									Submit
								</Button>
							</Grid>

							<Grid item xs={12} align="center">
								<ShowAllComments></ShowAllComments>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</div>
			<Footer />
		</>
	)
}

export default ViewListPage
