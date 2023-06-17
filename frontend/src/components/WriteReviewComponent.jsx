/*
The Write a Review Component. This displays when the user clicks on "Write a Review..." on the game page

This allows the user to express in words their feelings about a game, or they just want to write a meme.
For example, my review for Nier: Automata:

"This game ruined my life."
5/5 Stars.

The user has the box art visible at all times, along with the title
They are also able to give the 5 star rating from here. If the user already put a rating on the game page, it
will transfer over to this component

Sub options are available to the user, which are all optional:
They can mark what platform they played it on, in a search bar
They can catalog the number of hours put into the game, in a numbers-only field
They can say how many times they beat the game, in a numbers-only field
They can mark their review as containing spoilers, in a check box

They can also tag their review with surface-level tags, both positive and negative, in a search bar
For example, if the user thought the soundtrack was great, they can add that as a positive attribute
If they didn't like the voice acting though, they can include that as a negative attribute

Near the bottom, they have more options:
Cancel: discards all edits made on the component and closes it

Submit: submits the review to the database and displays it on the user's page. It can also appear in follower's feeds
or below the game page itself if certain conditions are met
*/

import { Box, Button, Card, CardContent, Checkbox, FormControlLabel, Grid, Rating, TextField, Typography, Select, FormControl, MenuItem } from "@mui/material"
import { Stack } from "@mui/system"
import { useEffect, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { doc, serverTimestamp, setDoc, arrayUnion, updateDoc, getDoc, deleteField, Timestamp } from "firebase/firestore"
import { auth, db } from "../firebase.config"
import { uuidv4 } from "@firebase/util"
import { useParams } from "react-router-dom"
import SelectTagsComponent from "../components/SelectTagsComponent"
import { getFunctions, httpsCallable } from "firebase/functions"

function WriteReviewComponent(props) {
	const [review, setReview] = useState({
		reviewText: "",
		platform: "",
		hoursPlayed: "",
		timesCompleted: "",
		containsSpoiler: false,
		positiveAttributes: [],
		negativeAttributes: [],
		rating: 0,
		gameCover: "",
		gameTitle: "",
		gameReleaseDate: ""
	})

	const [positiveTagsSelected, setPositiveTagsSelected] = useState([])
	const [negativeTagsSelected, setNegativeTagsSelected] = useState([])

	const [selectedPlatform, setSelectedPlatform] = useState("")
	const [openPlatformSelection, setOpenPlatformSelection] = useState(false)

	const numRegex = /^[0-9]*$/

	const handlePlatformClose = () => {
		setOpenPlatformSelection(false)
	}

	const handlePlatformOpen = () => {
		setOpenPlatformSelection(true)
	}

	const [disableSubmit, setDisableSubmit] = useState(false)
	const { currentUser } = auth
	const userID = currentUser.uid

	let { gameID } = useParams()

	const functions = getFunctions()
	const addGamesToRecommended = httpsCallable(functions, "addGamesToRecommended")
	const removeGamesFromRecommended = httpsCallable(functions, "removeGamesFromRecommended")

	// set the data of the review to display
	useEffect(() => {
		if (props.reviewExists && props.reviewData) {
			setReview({ ...props.reviewData, reviewText: props.reviewData.review })
			setPositiveTagsSelected(props.reviewData.positiveAttributes)
			setNegativeTagsSelected(props.reviewData.negativeAttributes)
		}
	}, [props.reviewData])

	const handleReviewTextChange = (e) => {
		setReview({ ...review, reviewText: e.target.value })
	}

	const handlePlatformChange = (e) => {
		setReview({ ...review, platform: e.target.value })
		setSelectedPlatform(e.target.value)
	}

	const handleHoursPlayedChange = (e) => {
		e.preventDefault()
		const hoursPlayedText = e.target.value

		if (!numRegex.test(hoursPlayedText)) return
		const isEmpty = hoursPlayedText === ""
		if (hoursPlayedText.length <= 5) setReview({ ...review, hoursPlayed: isEmpty ? "" : parseInt(hoursPlayedText) })
	}

	const handleTimesCompletedChange = (e) => {
		e.preventDefault()
		const timesCompletedText = e.target.value
		if (!numRegex.test(timesCompletedText)) return
		const isEmpty = timesCompletedText === ""
		if (timesCompletedText.length <= 3) setReview({ ...review, timesCompleted: isEmpty ? "" : parseInt(timesCompletedText) })
	}

	const handleContainsSpoilerChange = () => {
		setReview({ ...review, containsSpoiler: review.containsSpoiler ? false : true })
	}

	const handleRatingChange = (e) => {
		// if a rating is given, automatically mark it as played
		setReview({ ...review, rating: parseFloat(e.target.value) })
	}

	const handlePositiveChange = (value) => {
		setPositiveTagsSelected(
			// On autofill we get a stringified value.
			typeof value === "string" ? value.split(",") : value
		)
		setReview({ ...review, positiveAttributes: value })
	}

	const handleNegativeChange = (value) => {
		setNegativeTagsSelected(
			// On autofill we get a stringified value.
			typeof value === "string" ? value.split(",") : value
		)

		setReview({ ...review, negativeAttributes: value })
	}

	const gameSpecificReviewsExists = async () => {
		const docSnap = await getDoc(doc(db, "gameSpecificReviews", gameID))
		return docSnap.exists()
	}

	// updates the global rating feild when a new review is submitted
	const computeNewRating = async (gameId) => {
		const gameSpecificReviewsRef = doc(db, "gameSpecificReviews", gameId)
		const specificReviewSnap = await getDoc(gameSpecificReviewsRef)
		const gameReviewData = specificReviewSnap.data()

		// doc.data() is never undefined for query doc snapshots
		let ratings = { 0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0 }
		let reviewSum = 0
		let reviewCount = 0
		const reviews = gameReviewData.reviews
		for (let i = 0; i < reviews.length; i++) {
			const reviewId = reviews[i]
			reviewCount += 1
			const reviewRef = doc(db, "reviews", reviewId)
			const reviewSnap = await getDoc(reviewRef)
			const currentRating = reviewSnap.data().rating
			ratings[currentRating] += 1
			reviewSum += currentRating
		}
		const globalRating = reviewSum / reviewCount
		await updateDoc(doc(db, "gameSpecificReviews", gameId), {
			globalRating: globalRating,
			ratings: ratings
		})
	}

	const createReview = async () => {
		if (!review.rating) {
			errorToast("You must include a star rating.", 2000)
		} else {
			setDisableSubmit(true)
			if (props.reviewExists) {
				// update similar games from game being updated if it comes from 3.5+ to less than that or viceversa
				const reviewSnap = await getDoc(doc(db, "reviews", props.reviewId))
				const oldRating = reviewSnap.data().rating
				if (oldRating < 3.5 && review.rating >= 3.5) {
					addGamesToRecommended({ reviewedGame: gameID, similarGames: props.similarGames }).then((res) => {
						console.log(`[recommendation]: addGamesToRecommended() done`)
					})
				} else if (oldRating >= 3.5 && review.rating < 3.5) {
					removeGamesFromRecommended({ reviewedGame: gameID, similarGames: props.similarGames }).then((res) => {
						console.log(`[recommendation]: removeGamesFromRecommended() done`)
					})
				}
				// Review already exists, so update doc
				await updateDoc(doc(db, "reviews", props.reviewId), {
					...review,
					review: review.reviewText
				})
				await updateDoc(doc(db, "reviews", props.reviewId), {
					reviewText: deleteField()
				})
				successToast("Your review has been updated!", 2000)
				computeNewRating(gameID)

				setTimeout(() => {
					props.cancelHandler()
					setDisableSubmit(false)
					props.loadReviews(true)
				}, 1000)
			} else {
				// Review does not exist, create new one
				const reviewID = uuidv4()
				await setDoc(doc(db, "reviews", reviewID), {
					userId: currentUser.uid,
					gameId: gameID,
					review: review.reviewText,
					rating: review.rating,
					containsSpoiler: review.containsSpoiler,
					positiveAttributes: positiveTagsSelected,
					negativeAttributes: negativeTagsSelected,
					createdAt: serverTimestamp(),
					platform: review.platform,
					hoursPlayed: review.hoursPlayed === "" ? 0 : review.hoursPlayed,
					timesCompleted: review.timesCompleted === "" ? 0 : review.timesCompleted,
					upvotes: [],
					downvotes: [],
					gameCover: props.gameCoverProp,
					gameTitle: props.gameTitleProp,
					gameReleaseDate: props.gameReleaseDateProp,
					comments: [],
					liked: false,
				})

				// Add review to user's list of reviews
				const userRef = await doc(db, "users", userID)
				await updateDoc(userRef, {
					reviews: arrayUnion(reviewID)
				})

				if (review.rating >= 3.5) {
					// check if similar games can be recommended
					addGamesToRecommended({ reviewedGame: gameID, similarGames: props.similarGames }).then((res) => {
						console.log(`[recommendation]: ${res.data}`)
					})
				}

				// Add review to game's specific list of reviews
				if (await gameSpecificReviewsExists()) {
					await updateDoc(doc(db, "gameSpecificReviews", gameID), {
						reviews: arrayUnion(reviewID)
					})
					computeNewRating(gameID)
				} else {
					let ratings = { 0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0 }
					ratings[review.rating] += 1
					const avg = review.rating
					await setDoc(doc(db, "gameSpecificReviews", gameID), {
						reviews: arrayUnion(reviewID),
						ratings: ratings,
						globalRating: avg
					})
				}

				// set notification to followers of current user about writing a review
				const userSnap = await getDoc(userRef)
				const followers = userSnap.data().followers
				for (const followerId of followers) {
					const followerRef = await doc(db, "users", followerId)
					const notificationObj = {
						id: uuidv4(),
						createdAt: Timestamp.now(),
						senderId: userID,
						senderProfilePic: userSnap.get("profilePic"),
						text: `@${userSnap.get("username")} wrote a review for ${props.gameTitleProp} (${props.gameReleaseDateProp}).`,
						data: {
							gameId: gameID,
							gameCover: props.gameCoverProp,
							gameTitle: props.gameTitleProp,
							gameReleaseDate: props.gameReleaseDateProp,
							username: userSnap.get("username")
						},
						seen: false,
						scenario: 2
					}
					updateDoc(followerRef, {
						"notifications": arrayUnion(notificationObj)
					})
				}

				successToast("Your review has been logged!", 2000)
				setTimeout(() => {
					props.cancelHandler()
					setDisableSubmit(false)
				}, 1000)
			}
			// set the specific reviews of the game null so the useEffect rerenders the reviews component
			props.loadReviews(true)
		}
	}

	const errorToast = (text, time) => {
		return toast.error(text, {
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

	return (
		<>
			<Card sx={{ bgcolor: "#252525", borderRadius: 3, width: "60em" }}>
				<CardContent>
					{/* In a grid layout, usually 2 columns */}

					{/* Box art */}
					<Grid container>
						<Grid item xs={3}>
							<Box
								component="img"
								width={215}
								height={300}
								borderRadius={3}
								sx={{
									backgroundColor: "#FFF"
								}}
								src={props.gameCoverProp}></Box>
						</Grid>

						<Grid item xs={9}>
							<Card sx={{ bgcolor: "#403C3C", borderRadius: 3 }}>
								<CardContent>
									{/* Title box */}
									<Box
										sx={{
											backgroundColor: "#4C2F97",
											borderRadius: 3,
											mt: -2,
											width: "auto",
											height: "auto"
										}}>
										<Typography ml={2} color="#FFF" fontSize={23}>
											{props.gameTitleProp} ({props.gameReleaseDateProp})
										</Typography>
									</Box>

									<Typography color="#FFF" sx={{ mt: 1 }}>
										Add your review:
									</Typography>
									{/* Adding a review text field */}
									<TextField
										fullWidth
										id="fullWidth"
										variant="outlined"
										multiline
										rows={8}
										value={review.reviewText}
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
										onChange={handleReviewTextChange}
									/>
								</CardContent>
							</Card>
						</Grid>

						{/* Platform entry */}
						<Grid item xs={3}>
							{/* Rating with 5 star system, carries over from GamePage */}
							<Box mt={1}>
								<Typography color="#FFF">Your Rating:</Typography>
							</Box>
							<Rating
								name="simple-controlled"
								value={review.rating}
								precision={0.5}
								sx={{
									fontSize: "2.75rem",
									"& .MuiRating-iconFilled": {
										color: "#7952de"
									},
									"& .MuiRating-iconEmpty": {
										color: "#7952de"
									}
								}}
								onChange={handleRatingChange}
							/>

							<Typography color="#FFF">Platform:</Typography>

							<Box bgcolor="#FFF" borderRadius={1} width="13.5rem" height="3.5rem">
								<FormControl sx={{ width: "13.5rem" }}>
									<Select
										open={openPlatformSelection}
										onClose={handlePlatformClose}
										onOpen={handlePlatformOpen}
										value={selectedPlatform}
										onChange={handlePlatformChange}>
										<MenuItem key="" value="">
											<em>{"<No platform>"}</em>
										</MenuItem>
										{props.gamePlatformsProp.map((name) => (
											<MenuItem key={name} value={name}>
												{name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>

							{/* Hours played entry */}
							<Typography color="#FFF" mt={1}>
								Hours Played:
							</Typography>

							<Box bgcolor="#FFF" borderRadius={1} width="13.5rem" height="2.5rem">
								<TextField
									value={review.hoursPlayed}
									fullWidth
									id="outlined-number"
									variant="outlined"
									size="small"
									sx={{ input: { color: "#000" } }}
									onChange={handleHoursPlayedChange}
								/>
							</Box>

							{/* Times Completed entry */}
							<Typography color="#FFF" mt={1}>
								Times Completed:
							</Typography>

							<Box bgcolor="#FFF" borderRadius={1} width="13.5rem" height="2.5rem">
								<TextField
									value={review.timesCompleted}
									fullWidth
									id="outlined-number"
									variant="outlined"
									size="small"
									sx={{ input: { color: "#000" } }}
									onChange={handleTimesCompletedChange}
								/>
							</Box>

							{/* Contains Spoilers  entry */}
							<FormControlLabel
								sx={{ mt: 1, color: "#FFF" }}
								label="Contains Spoilers"
								labelPlacement="start"
								control={
									<Checkbox
										checked={review.containsSpoiler}
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

						{/* Contains sub grid inside, 1st row is 4 cols, 2nd is two cols */}
						<Grid item xs={9}>
							<Grid container>
								{/* Positive attributes entry */}
								<Grid item xs={6}>
									<Typography color="#FFF" mt={2}>
										Positive Attributes:
									</Typography>

									<SelectTagsComponent tags={props.tags} handleTagsSelected={handlePositiveChange} val={positiveTagsSelected} />
								</Grid>

								{/* Negative attributes entry */}
								<Grid item xs={6}>
									<Typography color="#FFF" mt={2}>
										Negative Attributes:
									</Typography>

									<SelectTagsComponent tags={props.tags} handleTagsSelected={handleNegativeChange} val={negativeTagsSelected} />
								</Grid>
							</Grid>
						</Grid>

						{/* Spacer */}
						<Grid item xs={9}></Grid>

						{/* the 3 options near the bottom arranged in a row stack */}
						<Grid item xs={3} >
							<Stack ml={1} direction="row" spacing={0}>
								<Box>
									<Button onClick={props.cancelHandler} sx={{ textTransform: "none" }}>
										<Typography color="#FFF" sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
											Cancel
										</Typography>
									</Button>
								</Box>

								<Box color="#FFF">
									<Typography mt={0.5} >|</Typography>
								</Box>

								<Box
									textAlign="center"
									sx={{
										width: 100,
										maxHeight: 55,
										bgcolor: "#4C2F97",
										borderRadius: 3,
										ml: 1
									}}>
									<Button onClick={createReview} sx={{ textTransform: "none", color: "#FFF" }} disabled={disableSubmit}>
										<Typography color="#FFF" align="center">
											{props.reviewExists ? "UPDATE" : "SUBMIT"}
										</Typography>
									</Button>
								</Box>
							</Stack>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
			<ToastContainer />
		</>
	)
}

export default WriteReviewComponent
