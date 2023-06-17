/*
The Games Reviewed Page. This displays when a user wants to see all of their, or another users', games
It displays all games this user has given stars or written reviews for with the ability to sort them

Clicking on the game covers will redirect to its specific game page
*/

import { Box, Card, CardContent, createTheme, Grid, Rating, ThemeProvider, Tooltip, Typography, Zoom } from "@mui/material"
import React, { useEffect, useState } from "react"
import { SentimentVeryDissatisfied } from "@mui/icons-material"
import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import Footer from "../components/FooterComponent"
import SortReviewsComponent from "../components/SortReviewsComponent"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { db } from "../firebase.config"
import SpinnerComponent from "../components/SpinnerComponent"
import { useNavigate, useParams } from "react-router"
import Spinner from "../components/Spinner"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Favorite } from "@mui/icons-material"

// Header font
const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

// returns an error toast in the corner
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

function GamesReviewed() {
	const { username } = useParams()

	const [reviews, setReviews] = useState([])
	const [reviewsToShow, setReviewsToShow] = useState(true)

	const [gettingData, setGettingData] = useState(null)

	const navigate = useNavigate()

	const [sortOption, setSortOption] = useState("Oldest")
	const [min, setMin] = useState(0.0)
	const [max, setMax] = useState(5.0)

	// useEffect for getting all games reviewed
	useEffect(() => {
		const getUserData = async () => {
			const usersRef = collection(db, "users")
			const q = query(usersRef, where("username", "==", username))
			const userSnapshot = await getDocs(q)
			if (userSnapshot.empty) navigate("/notfound")

			let userID = ""

			userSnapshot.forEach((user) => {
				userID = user.id
			})

			// get most recent reviews and append them to a list
			let reviews = []
			const reviewsRef = collection(db, "reviews")
			const qu = query(reviewsRef, where("userId", "==", userID), orderBy("createdAt"))
			const reviewSnapshot = await getDocs(qu)

			if (reviewSnapshot.empty) setReviewsToShow(false)

			reviewSnapshot.forEach((review) => {
				reviews.push({
					id: review.id,
					createdAt: review.data().createdAt,
					rating: review.data().rating,
					gameCover: review.data().gameCover,
					gameTitle: review.data().gameTitle,
					gameReleaseDate: review.data().gameReleaseDate,
					userId: review.data().userId,
					gameId: review.data().gameId,
					liked: review.data().liked
				})
			})

			setReviews(reviews)
			setGettingData(true)
		}
		getUserData()
	}, [username])

	// use effect for filtering reviews by star rating
	useEffect(() => {
		if (sortOption == "Star Range") {
			if (min > max) {
				errorToast("Min must be less than or equal to Max.", 2000)
				setMax(5)
				setMin(0)
			}
		}
	}, [sortOption, min, max])

	// JSX for showing all reviews for a game. appends to a list in html format
	function ShowAllReviews() {
		// if there are reviews to show, show a spinner until all games are populated
		if (reviewsToShow) {
			// if there's any reviews to show
			if (reviews.length !== 0) {
				let tempArr = reviews
				switch (sortOption) {
					case "Oldest":
						reviews.sort((a, b) => a.createdAt - b.createdAt)
						break
					case "Newest":
						reviews.sort((b, a) => a.createdAt - b.createdAt)
						break
					case "Highest Rated":
						reviews.sort((a, b) => b.rating - a.rating)
						break
					case "Lowest Rated":
						reviews.sort((b, a) => b.rating - a.rating)
						break
					case "Star Range":
						tempArr = []
						for (let i = 0; i < reviews.length; i++) {
							let rating = reviews[i].rating
							if (rating >= min && rating <= max) {
								tempArr.push(reviews[i])
							}
						}
						break
				}
				const rows = []
				for (let i = 0; i < reviews.length; i++) {
					reviews[i] &&
						tempArr.includes(reviews[i]) &&
						rows.push(
							<Grid item xs={4} sm={2.25} md={1.5} lg={1.5} key={i}>
								<Tooltip
									title={
										<React.Fragment>
											<Typography color="inherit">
												{reviews[i].gameTitle} ({reviews[i].gameReleaseDate})
											</Typography>
											{"Rated "} {reviews[i].rating} {reviews[i].rating === 1 ? " Star" : " Stars"}
											<Typography fontSize={"11px"}>
												{" "}
												Created at: {new Date(reviews[i].createdAt.seconds * 1000).toDateString()}{" "}
											</Typography>
										</React.Fragment>
									}
									placement="right"
									arrow
									TransitionComponent={Zoom}>
									<Box
										component="img"
										width={90}
										height={120}
										sx={{
											backgroundColor: "#FFF",
											borderRadius: 3,
											"&:hover": { cursor: "pointer", border: 3, borderColor: "#4C2F97", mt: -0.3, mb: -0.4 }
										}}
										onClick={() => navigate(`/game/${reviews[i].gameId}`)}
										src={reviews[i].gameCover}></Box>
								</Tooltip>

								<Grid container>

									{/* show a heart if the game is marked as liked */}
									{reviews[i].liked ? (
										<>
											<Grid item xs={12}>
												<Rating
													value={reviews[i].rating}
													size="small"
													precision={0.5}
													sx={{
														mb: 3,
														"& .MuiRating-iconFilled": {
															color: "#7952de"
														},
														"& .MuiRating-iconEmpty": {
															color: "#7952de"
														},
														fontSize: "1rem"
													}}
													readOnly
												/>
												<Favorite sx={{ color: "#eb4034", mb: -0.25, width: 20, height: 20 }} />
											</Grid>
										</>
									) : (
										<>
											<Grid item xs={12}>
												<Rating
													value={reviews[i].rating}
													size="small"
													precision={0.5}
													sx={{
														mb: 3,
														"& .MuiRating-iconFilled": {
															color: "#7952de"
														},
														"& .MuiRating-iconEmpty": {
															color: "#7952de"
														},
														fontSize: "1rem"
													}}
													readOnly
												/>
											</Grid>
										</>
									)}
								</Grid>
							</Grid>
						)
				}
				return (
					<>
						{rows.length !== 0 ? (
							rows
						) : (
							<Grid item xs={12}>
								<NoReviewsJSX />
							</Grid>
						)}
					</>
				)
			} else {
				return (
					<Grid item xs={12}>
						<Card className="card" sx={{ bgcolor: "#252525", color: "#ffffff", width: "auto", borderRadius: 3, mb: 5, maxWidth: 915 }}>
							<CardContent>
								<SpinnerComponent override={{ position: "relative", margin: "50px" }} />
							</CardContent>
						</Card>
					</Grid>
				)
			}
		}

		// otherwise there's no reviews to show at all, so say there's no reviews to display
		// along with a frowny face :(
		else
			return (
				<Grid item xs={12}>
					<NoReviewsJSX />
				</Grid>
			)
	}

	// returns a "no reviews to display" component with frowny face :(
	const NoReviewsJSX = () => {
		return (
			<Card className="card" sx={{ bgcolor: "#252525", color: "#fff", width: "auto", borderRadius: 3, mb: 5, maxWidth: 800 }}>
				<CardContent>
					<SentimentVeryDissatisfied fontSize="large" />

					<ThemeProvider theme={theme}>
						<Typography>No Reviews to Display</Typography>
					</ThemeProvider>
				</CardContent>
			</Card>
		)
	}

	if (!gettingData) return <Spinner />
	return (
		<>
			<div className="content-wrapper">
				<Navbar />
				<SideNav />
				<Grid container sx={{ width: "auto", mb: 3, mt: 3 }}>
					<Grid item xs={12} align={"center"}>
						<Card className="card" sx={{ bgcolor: "#252525", width: "auto", borderRadius: 3, mb: 5, maxWidth: 915 }}>
							<CardContent>
								<Grid container rowSpacing={1} columnSpacing={2} sx={{ width: "auto", mb: 3 }}>
									{/* first row, header */}
									<Grid item xs={12}>
										<Grid className="box" borderRadius={3} container align={"center"} sx={{ mx: 3, width: "auto", maxWidth: 915 }}>
											<Grid item xs={12} sx={{ mx: 5, mt: 1, mb: 1, width: "auto" }}>
												<ThemeProvider theme={theme}>
													<Typography variant="h5" fontSize={"32px"} sx={{ flexGrow: 1 }}>
														All Games Reviewed by @{username}
													</Typography>
												</ThemeProvider>
											</Grid>
										</Grid>
									</Grid>

									{/* next row, sorting options */}
									<Grid item xs={12} align="center">
										<SortReviewsComponent
											sortingTextLen={10}
											sortByLen={2}
											dividerLen={12}
											setSortOption={setSortOption}
											setMin={setMin}
											setMax={setMax}
											min={min}
											max={max}
											showFollowingOption={false}
											showContoversialOption={false}
											showTagsOption={false}
										/>
									</Grid>

									{/* next row, stars listed under game */}
									<Grid item xs={12} align="center">
										<Grid container>
											<ShowAllReviews />
										</Grid>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</div>
			<ToastContainer />
			<Footer />
		</>
	)
}

export default GamesReviewed
