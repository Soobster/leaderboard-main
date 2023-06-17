/*
The ReviewUnderGameComponent. This only displays under a game page. This is one of the variants of what 
reviews will look like. This component is structured like so:

On the leftmost side is the user's profile picture, next to that is their username and their star rating
Below that is the actual content of the user's review. 

On the rightmost side are 3 fields. These fields do not appear if there is no valuable data for them.
Played On tells you what platform they played the game on
Hours Played tells you how many hours this user logged
Times Completed tells you how many times this user "beat" the game

On the bottom left are the upvotes and downvotes this review has

To the bottom right is an option to "See full review..." 
This will open a Dialog that will allow the user to see all the details of a user's review 

TODO
* add a max height so one review doesn't take up the whole page
* make "See full review" only appear if the size of the review is greater than the max height
*/

import {
	Box,
	Card,
	CardContent,
	Typography,
	createTheme,
	ThemeProvider,
	Grid,
	Avatar,
	Rating,
	Button,
	Chip,
	Autocomplete,
	TextField,
	Dialog,
	DialogTitle,
	DialogContentText,
	DialogActions,
	DialogContent,
	Divider,
	Checkbox,
	FormControlLabel
} from "@mui/material"

import { ThumbUp, ThumbDown, Delete, Comment, SentimentVeryDissatisfied } from "@mui/icons-material"
import { auth, db } from "../firebase.config"
import { useEffect, useState } from "react"
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc, deleteDoc, Timestamp, setDoc, serverTimestamp } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { uuidv4 } from "@firebase/util"
import { computeNewRating } from "../helperFunctions/computeNewRatingFunction"
import CommentComponent from "./CommentComponent"
import SpinnerComponent from "./SpinnerComponent"
import { commentNotification } from "../helperFunctions/commentNotifications"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

// displays the tags related to the review
function DisplayTags(props) {
	return (
		<Autocomplete
			sx={{
				background: "linear-gradient(#353535,#565656)",
				mr: 1,
				borderRadius: 1
			}}
			limitTags={props.limit}
			value={props.tags}
			multiple
			id="tags-filled"
			options={[]}
			freeSolo
			readOnly
			size="small"
			renderTags={(value, getTagProps) =>
				value.map((option, index) => (
					<Chip label={option} size="small" {...getTagProps({ index })} sx={{ background: "linear-gradient(#4f319b,#362269)", color: "#FFF" }} />
				))
			}
			renderInput={(params) => <TextField {...params} />}
		/>
	)
}

function ReviewUnderGameComponent(props) {
	const { currentUser } = auth
	const userID = currentUser.uid
	const navigate = useNavigate()

	const [upvotes, setUpvotes] = useState(props.upvotes.length)
	const [downvotes, setDownvotes] = useState(props.downvotes.length)
	const [upvote, setUpvote] = useState(false)
	const [downvote, setDownvote] = useState(false)

	const playedOnPlatform = "Played On: " + props.platform
	const hoursPlayedValue = "Hours Played: " + props.hoursPlayed
	const timesCompletedValue = "Times Completed: " + props.timesCompleted
	const containsSpoiler = props.containsSpoiler
	const [showSpoiler, setShowSpoiler] = useState(false)

	const [clickedDelete, setClickedDelete] = useState(false)

	const [comment, setComment] = useState("")
	const [disableSubmit, setDisableSubmit] = useState(false)
	const [commentContainsSpoiler, setCommentContainsSpoiler] = useState(false)

	const [commentIds, setCommentIds] = useState(null)
	const [comments, setComments] = useState(null)
	const [commentsToShow, setCommentsToShow] = useState(null)

	const [date, setDate] = useState(new Date(props.createdAt.seconds * 1000).toDateString())

	// useEffect for setting upvotes and downvote values
	useEffect(() => {
		const setUpvoteSelection = async () => {
			const reviewDocRef = await doc(db, "reviews", props.id)
			const reviewSnap = await getDoc(reviewDocRef)
			const upvotesArray = reviewSnap.get("upvotes")
			const downvotesArray = reviewSnap.get("downvotes")
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
		setUpvoteSelection()
	}, [])

	// useEffect for getting comments
	useEffect(() => {
		getComments()
	}, [])

	// gets comments for review
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

	// gets comment ids
	async function getComments() {
		setCommentIds(null)

		const reviewDocRef = doc(db, "reviews", props.id)
		const reviewDocSnap = await getDoc(reviewDocRef)

		setCommentIds(reviewDocSnap.data().comments)
	}

	// sets state for the comment text
	const handleCommentTextChange = (e) => {
		setComment(e.target.value)
	}

	// sets state for the comment containing a spoiler
	const handleContainsSpoilerChange = () => {
		if (commentContainsSpoiler) setCommentContainsSpoiler(false)
		else setCommentContainsSpoiler(true)
	}

	// adds a comment to the db
	const createComment = async () => {
		if (comment) {
			setDisableSubmit(true)

			const commentID = uuidv4()
			await setDoc(doc(db, "comments", commentID), {
				userId: currentUser.uid,
				comment: comment,
				containsSpoiler: commentContainsSpoiler,
				createdAt: serverTimestamp(),
				upvotes: [],
				downvotes: [],
				replies: [],
				parentType: "review"
			})

			// Add comment to user's list of comments
			const userRef = await doc(db, "users", userID)
			await updateDoc(userRef, {
				comments: arrayUnion(commentID)
			})

			// Add comment to review obj
			await updateDoc(doc(db, "reviews", props.id), {
				comments: arrayUnion(commentID)
			})

			await commentNotification(userID, props.userId, null, {
				gameId: props.gameId,
				gameCover: props.gameCover,
				gameTitle: props.gameTitle,
				gameReleaseDate: props.gameReleaseDate,
				ownerID: props.userId
			})

			setComment("")
			setDisableSubmit(false)
			setCommentContainsSpoiler(false)

			getComments()
		}
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
							parentId={props.id}
							reloadPage={getComments}
							containsSpoiler={comments[i].containsSpoiler}
							createdAt={comments[i].createdAt}
							gameData={{
								gameId: props.gameId,
								gameCover: props.gameCover,
								gameTitle: props.gameTitle,
								gameReleaseDate: props.gameReleaseDate,
								ownerID: props.userId
							}}
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
					<Grid item sm={12} align="center">
						<NoCommentsJSX />
					</Grid>
				</>
			)
	}

	// to be displayed if there are no comments related to a review
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

	// if vote == 0 => downvote, else upvote
	const manageVote = async (vote) => {
		const reviewDocRef = await doc(db, "reviews", props.id)
		const reviewSnap = await getDoc(reviewDocRef)
		const upvotesArray = reviewSnap.get("upvotes")
		const downvotesArray = reviewSnap.get("downvotes")

		if (vote ? upvotesArray.includes(userID) : downvotesArray.includes(userID)) {
			await updateDoc(reviewDocRef, {
				[`${vote ? "upvotes" : "downvotes"}`]: arrayRemove(userID)
			})
			vote ? setUpvotes(--upvotesArray.length) : setDownvotes(--downvotesArray.length)
			vote ? setUpvote(false) : setDownvote(false)
		} else {
			if (vote ? downvotesArray.includes(userID) : upvotesArray.includes(userID)) {
				await updateDoc(reviewDocRef, {
					[`${vote ? "downvotes" : "upvotes"}`]: arrayRemove(userID)
				})
				vote ? setDownvotes(--downvotesArray.length) : setUpvotes(--upvotesArray.length)
				vote ? setDownvote(false) : setUpvote(false)
			}
			await updateDoc(reviewDocRef, {
				[`${vote ? "upvotes" : "downvotes"}`]: arrayUnion(userID)
			})

			if (userID !== props.userId) {
				// set notification for user upvoting a review
				const reviewUserRef = await doc(db, "users", props.userId)
				const userRef = await doc(db, "users", userID)
				const userSnap = await getDoc(userRef)

				updateDoc(reviewUserRef, {
					notifications: arrayUnion({
						id: uuidv4(),
						createdAt: Timestamp.now(),
						senderId: userID,
						senderProfilePic: userSnap.get("profilePic"),
						text: `@${userSnap.get("username")} liked your review for ${props.gameTitle} (${props.gameReleaseDate})!`,
						data: {
							gameId: props.gameId,
							gameCover: props.gameCover,
							gameTitle: props.gameTitle,
							gameReleaseDate: props.gameReleaseDate,
							username: userSnap.get("username")
						},
						seen: false,
						scenario: 0
					})
				})
			}

			vote ? setUpvotes(++upvotesArray.length) : setDownvotes(++downvotesArray.length)
			vote ? setUpvote(true) : setDownvote(true)
		}
	}

	// jsx for obscuring a review
	function ObscureReview(props) {
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
						This review contains spoilers!
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

	// state and open and close handlers for Show Full Review

	const [openShowFullReview, setOpenShowFullReview] = useState(false)

	const handleClickOpenShowFullReview = () => {
		setShowSpoiler(true)
		setOpenShowFullReview(true)
	}

	const handleCloseShowFullReview = () => {
		setOpenShowFullReview(false)
	}

	// state and open and close handlers for Confirm Delete Review
	const [openConfirmDeleteReview, setOpenConfirmDeleteReview] = useState(false)

	const handleClickOpenConfirmDeleteReview = () => {
		setOpenConfirmDeleteReview(true)
	}

	const handleCloseConfirmDeleteReview = () => {
		setOpenConfirmDeleteReview(false)
	}

	const revealSpoiler = () => {
		setShowSpoiler(true)
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
								maxWidth: 850
							}}>
							<ObscureReview />
						</Card>
					</Grid>
				</>
			) : (
				<>
					{/* Dialog for seeing the full review, you'll want to shrink this since it's super ugly (sizewise) 
						This used to be in its own function, but now it's here. Why? Because React will rerender the 
						dialog every time you try to edit the text field, unless you put the dialog
						in the base of the return. Blame React! Not me! */}

					<Dialog
						onClose={handleCloseShowFullReview}
						open={openShowFullReview}
						scroll="body"
						width="auto"
						maxWidth="800"
						PaperProps={{
							style: {
								backgroundColor: "transparent",
								boxShadow: "none"
							}
						}}>
						<Grid
							container
							sx={{
								boxShadow: "0px 0px 15px #0f0f0f",
								background: "linear-gradient(#2e2e2e, #202020)",
								color: "#fff",
								width: "auto",
								borderRadius: 2,
								mb: 2,
								mt: 1,
								mr: 1,
								ml: 1,
								maxWidth: 850
							}}>
							{/* Profile pic */}
							<Grid item xs={2} md={1} align={"left"} sx={{ mt: 2, ml: 4 }}>
								<Avatar
									alt="username"
									src={props.profilePic}
									sx={{
										height: 40,
										width: 40,
										"&:hover": { cursor: "pointer", boxShadow: "0px 0px 15px #4C2F97" }
									}}
									onClick={() => navigate(`/${props.username}`)}
								/>
							</Grid>
							<Grid item xs={6} md={5} align={"left"} sx={{ mt: 1, ml: 1 }}>
								<Typography
									fontSize={"15px"}
									onClick={() => navigate(`/${props.username}`)}
									sx={{ "&:hover": { cursor: "pointer", textDecoration: "underline" } }}>
									@{props.username}
								</Typography>

								<Grid container>
									<Grid item xs={4.5} sm={3} md={2.5} align="left">
										<Typography fontSize={"15px"}>
											{props.rating} {props.rating === 1 ? "Star" : "Stars"}
										</Typography>
									</Grid>
									<Grid item xs={7.5} sm={7.5} md={9.5} align="left">
										<Rating
											value={props.rating ? props.rating : 0}
											size="small"
											precision={0.5}
											sx={{
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
								<Grid item xs={12} align="left" mt={1}>
									<Typography color="#a3a3a3" fontSize={"12px"}>
										Created at: {date}
									</Typography>
								</Grid>
							</Grid>
							{/* Review stats and info*/}
							<Grid item xs={12} md={4} mt={1} align="left">
								<Typography color="#a3a3a3" fontSize={"12px"}>
									{props.platform ? playedOnPlatform : ""}
								</Typography>
								<Typography color="#a3a3a3" fontSize={"12px"}>
									{props.hoursPlayed !== 0 ? hoursPlayedValue : ""}
								</Typography>
								<Typography color="#a3a3a3" fontSize={"12px"}>
									{props.timesCompleted !== 0 ? timesCompletedValue : ""}
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<Grid container>
									<Grid item xs={11} align="left">
										<ThemeProvider theme={theme}>
											<Typography
												style={{ whiteSpace: "pre-line " }}
												mt={1}
												ml={5}
												component={"span"}
												color="#fff"
												align={"left"}
												sx={{
													overflowY: "scroll",
													display: "-webkit-box",
													WebkitLineClamp: "8",
													WebkitBoxOrient: "vertical",
													flexGrow: 1,
													height: "auto"
												}}>
												{props.reviewText}
											</Typography>
										</ThemeProvider>
									</Grid>
									<Grid item xs={12} align="right" mt={-2} mr={1}>
										<Divider sx={{ borderBottomWidth: 1, mt: 4, mr: 1, ml: 1, mb: 2, bgcolor: "#a3a3a3" }} />
									</Grid>
								</Grid>
							</Grid>
							<Grid container sx={{ mt: 2, ml: 2 }}>
								{/* Upvotes icon and value */}
								<Grid item xs={1} align="center">
									<Avatar
										sx={{
											bgcolor: upvote ? "#4C2F97" : "#A1A1A1",
											width: 30,
											height: 30
										}}>
										<Button sx={{}} onClick={() => manageVote(1)}>
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
								<Grid item xs={1} mx={1} align="center">
									<Avatar
										sx={{
											bgcolor: downvote ? "#BD170A" : "#A1A1A1",
											width: 30,
											height: 30
										}}>
										<Button onClick={() => manageVote(0)}>
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
								{/* show tags if they exist in the review */}
								<Grid item xs={8} md={9} align="center" mt={-1} mb={1} ml={3}>
									{(props.positiveAttributes.length !== 0 || props.negativeAttributes.length !== 0) && (
										<Grid container>
											<Grid item xs={6}>
												{props.positiveAttributes.length !== 0 && (
													<Typography align="left" fontSize={"12px"}>
														Positive Attributes:
													</Typography>
												)}
												{props.positiveAttributes.length !== 0 && <DisplayTags color="#fff" tags={props.positiveAttributes} />}
											</Grid>
											<Grid item xs={6} align="right">
												{props.negativeAttributes.length !== 0 && (
													<Typography align="left" fontSize={"12px"}>
														Negative Attributes:
													</Typography>
												)}
												{props.negativeAttributes.length !== 0 && <DisplayTags tags={props.negativeAttributes} />}
											</Grid>
										</Grid>
									)}
								</Grid>
							</Grid>

							{/* comments section */}
							<Grid item xs={2}></Grid>

							<Grid item xs={10} mt={3}>
								<ThemeProvider theme={theme}>
									<Typography fontSize={"32px"} color="#FFF" sx={{ flexGrow: 1 }}>
										Comments
									</Typography>
								</ThemeProvider>
							</Grid>

							<Grid item xs={2}></Grid>

							<Grid item xs={10} mt={3}>
								<Typography fontSize={"16px"} color="#FFF" sx={{ flexGrow: 1 }}>
									Write a Comment:
								</Typography>
							</Grid>

							<Grid item xs={2}></Grid>

							<Grid item xs={9}>
								<TextField
									fullWidth
									id="fullWidth"
									variant="outlined"
									multiline
									rows={2}
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
									onChange={handleCommentTextChange}
								/>
							</Grid>

							<Grid item sm={1} xs={1}></Grid>

							<Grid item sm={9} xs={8} align="right" mt={1}>
								{/* Contains Spoilers  entry */}
								<FormControlLabel
									sx={{ mt: -0.5, color: "#FFF" }}
									label="Contains Spoilers"
									labelPlacement="start"
									control={
										<Checkbox
											checked={commentContainsSpoiler}
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

							<Grid item sm={2} xs={3} align="right" mt={1}>
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

							<Grid item sm={2} xs={0}></Grid>

							<Grid item sm={9} xs={12}>
								<ShowAllComments></ShowAllComments>
							</Grid>
						</Grid>
					</Dialog>

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
						}}>
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

					<Grid
						container
						sx={{
							boxShadow: "0px 0px 15px #0f0f0f",
							background: "linear-gradient(#2e2e2e, transparent)",
							color: "#fff",
							width: "auto",
							borderRadius: 2,
							mb: 2,
							mt: 1,
							mr: 1,
							ml: 1
						}}>
						{/* Profile pic */}
						<Grid item xs={1} align={"left"} sx={{ mt: 2, ml: 2 }}>
							<Avatar
								alt="username"
								src={props.profilePic}
								sx={{
									height: 40,
									width: 40,
									"&:hover": { cursor: "pointer", boxShadow: "0px 0px 15px #4C2F97" }
								}}
								onClick={() => navigate(`/${props.username}`)}
							/>
						</Grid>
						<Grid item xs={6} align={"left"} sx={{ mt: 1, ml: 1.75 }}>
							<Typography
								fontSize={"15px"}
								onClick={() => navigate(`/${props.username}`)}
								sx={{ "&:hover": { cursor: "pointer", textDecoration: "underline" } }}>
								@{props.username}
							</Typography>

							<Grid container>
								<Grid item xs={5} sm={2.75} md={3.5} align="left">
									<Typography fontSize={"15px"}>
										{props.rating} {props.rating === 1 ? "Star" : "Stars"}
									</Typography>
								</Grid>
								<Grid item xs={7} sm={9.25} md={8.5} align="left">
									<Rating
										value={props.rating ? props.rating : 0}
										size="small"
										precision={0.5}
										sx={{
											ml: props.rating % 1 === 0 ? -3 : -1.5,
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
							<Grid item xs={12} align="left" mt={1}>
								<Typography color="#a3a3a3" fontSize={"12px"}>
									Created at: {date}
								</Typography>
							</Grid>
						</Grid>
						{/* Review stats and info*/}
						<Grid item xs={4} mt={1} align="right">
							<Typography color="#a3a3a3" fontSize={"12px"}>
								{props.platform ? playedOnPlatform : ""}
							</Typography>
							<Typography color="#a3a3a3" fontSize={"12px"}>
								{props.hoursPlayed !== 0 ? hoursPlayedValue : ""}
							</Typography>
							<Typography color="#a3a3a3" fontSize={"12px"}>
								{props.timesCompleted !== 0 ? timesCompletedValue : ""}
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<Grid container>
								<Grid item xs={10} align="left">
									<ThemeProvider theme={theme}>
										<Typography
											mt={1}
											ml={3}
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
												maxHeight: 66
											}}>
											{props.reviewText}
										</Typography>
									</ThemeProvider>
								</Grid>
								<Grid item xs={12} align="right" mt={-2} mr={1}>
									<Button
										sx={{
											flexGrow: 1,
											borderRadius: 2,
											background: "linear-gradient(#313131,#252525)",
											color: "#aaa",
											boxShadow: "0px 0px 15px #151515",
											"&:hover": { color: "#fff", background: "linear-gradient(#4f319b,#362269)" }
										}}
										onClick={handleClickOpenShowFullReview}>
										<Typography sx={{ mb: -0.25, fontSize: 13, textTransform: "none" }}>See more</Typography>
									</Button>
									<Divider sx={{ borderBottomWidth: 1, mt: 2, mr: 1, ml: 1, bgcolor: "#a3a3a3" }} />
								</Grid>
							</Grid>
						</Grid>

						<Grid container sx={{ mt: 2, ml: 2 }}>
							{/* Upvotes icon and value */}
							<Grid item sm={0.5} mx={1} align="center">
								<Avatar
									sx={{
										bgcolor: upvote ? "#4C2F97" : "#A1A1A1",
										width: 30,
										height: 30
									}}>
									<Button onClick={() => manageVote(1)}>
										<ThumbUp
											sx={{
												color: "#FFF",
												width: 18,
												height: 18
											}}
										/>
									</Button>
								</Avatar>
								<Typography mt={1} ml={1}>
									{upvotes}
								</Typography>
							</Grid>

							{/* Downvotes icon and value */}
							<Grid item sm={0.5} mx={2} align="center">
								<Avatar
									sx={{
										bgcolor: downvote ? "#BD170A" : "#A1A1A1",
										width: 30,
										height: 30
									}}>
									<Button onClick={() => manageVote(0)}>
										<ThumbDown
											sx={{
												color: "#FFF",
												width: 18,
												height: 18
											}}
										/>
									</Button>
								</Avatar>
								<Typography mt={1} ml={1}>
									{downvotes}
								</Typography>
							</Grid>

							{/* Comments icon and value*/}
							<Grid item sm={0.5} mx={1} align="center">
								<Avatar
									sx={{
										width: 30,
										height: 30
									}}>
									<Button onClick={handleClickOpenShowFullReview}>
										<Comment
											sx={{
												color: "#FFF",
												width: 18,
												height: 18
											}}
										/>
									</Button>
								</Avatar>
								<Typography mt={1} ml={1}>
									{props.comments && props.comments.length}
								</Typography>
							</Grid>

							{/* only show the delete button if the userIDs match */}
							{props.userId === userID ? (
								<>
									<Grid item xs={0.5} mx={2} align="center" mb={1}>
										<Avatar
											sx={{
												bgcolor: "#BD170A",
												width: 30,
												height: 30
											}}>
											<Button onClick={handleClickOpenConfirmDeleteReview} disabled={clickedDelete}>
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
								<></>
							)}

							{/* show tags if they exist in the review */}
							<Grid item xs={10} md={7} align="center" mt={1} mb={1} ml={3}>
								{(props.positiveAttributes.length !== 0 || props.negativeAttributes.length !== 0) && (
									<Grid container>
										<Grid item xs={10} md={6}>
											{props.positiveAttributes.length !== 0 && (
												<Typography align="left" fontSize={"12px"}>
													Positive Attributes:
												</Typography>
											)}
											{props.positiveAttributes.length !== 0 && <DisplayTags color="#fff" tags={props.positiveAttributes} limit={1} />}
										</Grid>
										<Grid item xs={10} md={6} align="right">
											{props.negativeAttributes.length !== 0 && (
												<Typography align="left" fontSize={"12px"}>
													Negative Attributes:
												</Typography>
											)}
											{props.negativeAttributes.length !== 0 && <DisplayTags tags={props.negativeAttributes} limit={1} />}
										</Grid>
									</Grid>
								)}
							</Grid>
						</Grid>
					</Grid>
				</>
			)}
		</>
	)
}

export default ReviewUnderGameComponent
