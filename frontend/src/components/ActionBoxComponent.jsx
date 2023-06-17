/*
The Action Box Component. This displays when the user visits any game page. The card has lots of options available to the user.
At the top are 3 circles, Played, Backlog, and Favorite. The user can click on any of them and a check mark will appear,
this will reflect within the user's stats for this specific game.

The user can also rate the game with a 5 star system. After rating, it will automatically be marked as played.
Additionally, if the game was added to the backlog, it will automatically be removed

The User can also write a word review about the game by clicking "Write a Review...". This will display ReviewComponent, and 
the user can follow along from there

The can also add to a list by clicking on "Add to List...", this will take them to the list creation component

The can also share their review on social media platforms by clicking on "share"
*/

//displayed on game page
import { Avatar, Badge, Box, Button, Divider, Grid, IconButton, Rating, Typography } from "@mui/material"

import { Bookmarks, FavoriteBorderRounded } from "@mui/icons-material"
import styled from "@emotion/styled"
import { useState } from "react"
import EditIcon from "@mui/icons-material/Edit"

import { useParams } from "react-router-dom"
import { auth, db } from "../firebase.config"
import { arrayUnion, doc, getDoc, updateDoc, collection, query, where, getDocs, arrayRemove, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore"
import { useEffect } from "react"

import AddGameToListComponent from "../components/AddGameToListComponent"
import { toast, ToastContainer } from "react-toastify"
import { uuidv4 } from "@firebase/util"
import { computeNewRating } from "../helperFunctions/computeNewRatingFunction"

import { getFunctions, httpsCallable } from "firebase/functions"
import { removeBacklogGameFromRecommended } from "../helperFunctions/backlogRecommendation"

const SmallAvatar = styled(Avatar)(({ theme }) => ({
	width: 22,
	height: 22,
	border: `2px solid`
}))

function ActionBox(props) {
	// states for setting the onClick functions for the first 3 buttons
	const [showPlayedCheck, setShowPlayedCheck] = useState(false)
	const [showBacklogCheck, setShowBacklogCheck] = useState(false)

	const [username, setUsername] = useState(null)

	const [value, setValue] = useState(null)
	const { gameID } = useParams()

	const [deletedReview, setDeletedReview] = useState(false)

	// Get user (for user ID) if user is signed in
	const { currentUser } = auth
	const userID = currentUser.uid

	const functions = getFunctions()
	const addGamesToRecommended = httpsCallable(functions, "addGamesToRecommended")
	const removeGamesFromRecommended = httpsCallable(functions, "removeGamesFromRecommended")

	const [liked, setLiked] = useState(null)

	useEffect(() => {
		const getUserInfo = async () => {
			// query based method
			const usersRef = collection(db, "users")
			const q = query(usersRef, where("backlog", "array-contains", parseInt(gameID)))
			const querySnapshot = await getDocs(q)

			// document based method
			const userDocRef = doc(db, "users", userID)
			const docSnap = await getDoc(userDocRef)
			const existsInBacklog = docSnap.get("backlog").includes(parseInt(gameID))
			setShowBacklogCheck((prev) => existsInBacklog)
			setUsername(docSnap.get("username"))
		}
		getUserInfo()
	}, [])

	// updates the liked state when reviewExists is true
	useEffect(() => {
		const updateLikedState = async () => {
			setLiked(props.likedProp)
		}
		updateLikedState()
	}, [props.reviewExists])

	// returns true or false based off this game has its own collection in gameSpecificReviews already
	const gameSpecificReviewsExists = async () => {
		const docSnap = await getDoc(doc(db, "gameSpecificReviews", gameID))
		return docSnap.exists()
	}

	const createReview = async (value) => {
		if (props.reviewExists) {

			// if they change their review to 0 stars, remove it from the DB
			if (value === null) {
				await deleteReview()
				successToast("Your review has been removed!", 2000)
				setValue(0)
				setDeletedReview(true)
			}

			// otherwise, update the review
			else {
				// update similar games from game being updated if it comes from 3.5+ to less than that or viceversa
				const reviewSnap = await getDoc(doc(db, "reviews", props.reviewId))
				const oldRating = reviewSnap.data().rating
				if (oldRating < 3.5 && value >= 3.5) {
					addGamesToRecommended({ reviewedGame: gameID, similarGames: props.similarGames }).then((res) => {
						console.log(`[recommendation]: addGamesToRecommended() done`)
					})
				} else if (oldRating >= 3.5 && value < 3.5) {
					removeGamesFromRecommended({ reviewedGame: gameID, similarGames: props.similarGames }).then((res) => {
						console.log(`[recommendation]: removeGamesFromRecommended() done`)
					})
				}

				// Review already exists, so update doc
				await updateDoc(doc(db, "reviews", props.reviewId), {
					rating: value
				})
				successToast("Your review has been updated!", 2000)
				props.loadReviews(true)
			}

			computeNewRating(gameID)
		}

		else {
			// Review does not exist, create new one
			const reviewID = uuidv4()
			await setDoc(doc(db, "reviews", reviewID), {
				userId: currentUser.uid,
				gameId: gameID,
				review: "",
				rating: value,
				containsSpoiler: false,
				positiveAttributes: [],
				negativeAttributes: [],
				createdAt: serverTimestamp(),
				platform: "",
				hoursPlayed: 0,
				timesCompleted: 0,
				upvotes: [],
				downvotes: [],
				gameCover: props.gameCover,
				gameTitle: props.gameTitle,
				gameReleaseDate: props.gameReleaseDate,
				comments: [],
				liked: false,
			})

			// Add review to user's list of reviews
			const userRef = await doc(db, "users", userID)
			await updateDoc(userRef, {
				reviews: arrayUnion(reviewID)
			})

			if (value >= 3.5) {
				// check if similar games can be recommended
				addGamesToRecommended({ reviewedGame: gameID, similarGames: props.similarGames }).then((res) => {
					console.log(`[recommendation]: addGamesToRecommended() done`)
				})
			}

			// Add review to game's specific list of reviews
			if (await gameSpecificReviewsExists()) {
				await updateDoc(doc(db, "gameSpecificReviews", gameID), {
					reviews: arrayUnion(reviewID)
				})
				computeNewRating(gameID)
			}

			else {
				let ratings = { 0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0 }
				ratings[value] += 1
				const avg = value
				await setDoc(doc(db, "gameSpecificReviews", gameID), {
					reviews: arrayUnion(reviewID),
					ratings: ratings,
					globalRating: avg
				})
			}

			successToast("Your review has been logged!", 2000)

			// set the specific reviews of the game null so the useEffect rerenders the reviews component
			props.loadReviews(true)
		}
	}

	const deleteReview = async () => {
		// delete from reviews
		await deleteDoc(doc(db, "reviews", props.reviewId))

		// delete from users
		const userRef = await doc(db, "users", currentUser.uid)
		await updateDoc(userRef, { reviews: arrayRemove(props.reviewId) })

		// delete from gameSpecificReviews
		const gameSpecificReviewsRef = await doc(db, "gameSpecificReviews", gameID)
		await updateDoc(gameSpecificReviewsRef, { reviews: arrayRemove(props.reviewId) })

		// delete the document if there's no more reviews contained within that gameId
		const gameSpecificReviewsDocSnap = await getDoc(doc(db, "gameSpecificReviews", gameID))
		if (gameSpecificReviewsDocSnap.data().reviews.length === 0) {
			await deleteDoc(gameSpecificReviewsRef)
		}
		// removeGamesFromRecommended({ reviewedGame: gameID, similarGames: props.similarGames }).then((res) => {
		// 	console.log(`[recommendation]: removeGamesFromRecommended() done`)
		// })
	}

	const successToast = (text, time) => {
		return toast.success(text, {
			position: "bottom-right",
			autoClose: time,
			hideProgressBar: false,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: "light"
		})
	}

	// updates a user's backlog after they click the Backlog icon
	async function updateBacklog() {
		// get document method
		const userRef = doc(db, "users", userID)
		const docSnap = await getDoc(userRef)
		const existsInBacklog = docSnap.get("backlog").includes(parseInt(gameID))

		if (existsInBacklog) {
			await updateDoc(userRef, {
				backlog: arrayRemove(parseInt(gameID))
			})
		} else {
			await updateDoc(userRef, {
				backlog: arrayUnion(parseInt(gameID))
			})
			removeBacklogGameFromRecommended(userID, gameID)
		}
		// FIXME: The green check appears/dissapears before transaction is complete
		// If user refreshes/navigates off page before adding/removing game, transaction will be terminated
	}

	// updates a the "liked" field in a user's review
	async function updateLiked() {

		await updateDoc(doc(db, "reviews", props.reviewId), {
			liked: !liked
		})

		setLiked((prev) => !prev)
	}

	// JSX for creating a badge with an avatar icon passed in as the prop
	function ShowCheckJSX(props) {
		return (
			<>
				<Badge
					overlap="circular"
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					badgeContent={<SmallAvatar alt="check mark" src={require("../assets/Leaderboard_Logos/green_check.png")} />}>
					<Avatar>{props.avatarIcon}</Avatar>
				</Badge>
			</>
		)
	}

	//   Backlog icon check mark
	const showBacklogCheckJSX = (
		<>
			<ShowCheckJSX avatarIcon={<Bookmarks />} />
		</>
	)

	//   Favorite icon check mark
	const showLikedCheckJSX = (
		<>
			<ShowCheckJSX avatarIcon={<FavoriteBorderRounded />} />
		</>
	)

	return (
		<>
			<Grid className="box" borderRadius={2} container rowSpacing={2} maxWidth={250} minWidth={100}>
				<Grid item xs={12} align="center">
					<Typography color="#fff" >{props.reviewExists ? "Your Rating" : "Rate this game"}</Typography>
					{deletedReview ?
						<Typography color="#a3a3a3" fontSize={"14px"} mt={1}> Your review has been removed!</Typography>

						: <Rating
							name="simple-controlled"
							value={value ? value : value === 0 ? 0 : props.rating}
							precision={0.5}
							sx={{
								s: { fontSize: ".75rem" },
								m: { fontSize: "2.5rem" },
								"& .MuiRating-iconFilled": {
									color: "#7952de"
								},
								"& .MuiRating-iconEmpty": {
									color: "#7952de"
								}
							}}
							onChange={(event, newValue) => {

								// if a rating is given, automatically remove it from the backlog
								{
									newValue !== 0 && showBacklogCheck ? setShowBacklogCheck((prev) => false) : setShowPlayedCheck((prev) => false)
								}

								createReview(newValue)
							}}
						/>}
					<Divider sx={{ borderBottomWidth: 2, mt: 1.5, ml: 1, mr: 1, bgcolor: "#a3a3a3", width: "auto" }} />
				</Grid>


				<Grid item xs={12} align="center">
					<Button align="center" onClick={props.writeReviewHandler} sx={{ textTransform: "none", color: "#FFFFFF" }}>
						<EditIcon />
						<span>&nbsp;&nbsp;</span>
						<Typography align="center">{props.reviewExists ? "Edit Your Review..." : "Write a Review..."}</Typography>
					</Button>
					<Divider sx={{ borderBottomWidth: 2, mt: 2, ml: 1, mr: 1, bgcolor: "#a3a3a3", width: "auto" }} />
				</Grid>
				<Grid item xs={12} align="center" >
					{username && (
						<AddGameToListComponent username={username} />
					)}
					<Divider sx={{ borderBottomWidth: 2, mt: 2, ml: 1, mr: 1, bgcolor: "#a3a3a3", width: "auto" }} />
				</Grid>
				<Grid container sx={{ mt: 1, mb: 1 }}>

					{/* only show the like button if the user's review exists */}
					{props.reviewExists && !deletedReview ?
						<>
							<Grid xs={6} item align="center" >
								<IconButton
									onClick={() => {
										// add/remove from backlog
										updateBacklog()
										setShowBacklogCheck((prev) => !prev) // use to change check display
									}}>
									{showBacklogCheck && showBacklogCheckJSX}
									{!showBacklogCheck ? (
										<Avatar>
											<Bookmarks />
										</Avatar>
									) : (
										""
									)}
								</IconButton>
								<br />
								<Box color="#a3a3a3">
									<Typography>Backlog</Typography>
								</Box>
							</Grid>

							<Grid item xs={6} align="center">
								<IconButton
									onClick={() => {
										updateLiked()
									}}>
									{liked ? showLikedCheckJSX
										:
										<Avatar>
											<FavoriteBorderRounded />
										</Avatar>}

								</IconButton>
								<br />
								<Box color="#a3a3a3">
									<Typography>Like</Typography>
								</Box>
							</Grid>

						</>
						:
						<Grid xs={12} item align="center" >
							<IconButton
								onClick={() => {
									// add/remove from backlog
									updateBacklog()
									setShowBacklogCheck((prev) => !prev) // use to change check display
								}}>
								{showBacklogCheck && showBacklogCheckJSX}
								{!showBacklogCheck ? (
									<Avatar>
										<Bookmarks />
									</Avatar>
								) : (
									""
								)}
							</IconButton>
							<br />
							<Box color="#a3a3a3">
								<Typography>Backlog</Typography>
							</Box>
						</Grid>
					}

				</Grid>
			</Grid>

			<ToastContainer />
		</>
	)
}

export default ActionBox
