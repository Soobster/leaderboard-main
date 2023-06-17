/*
The Game Page. This displays when the user visits any game page. It gives a basic overview about the game along with
what the people you follow thought about it. 

This page is a grid divided into section, the first section has the box art and the global review graph

The second features information about the game. This includes the title, release date, publisher, tag line, game description,
genres, screenshots, and reviews by the people you follow

The third contains the action box and the platforms

Below that is a quick way to see what the people you follow rated this game

Below that is all the written reviews for this game

This page will contain many links that take you to many different webpages
*/

import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ActionBox from "../components/ActionBoxComponent"
import PlatformComponent from "../components/PlatformComponent"
import { Avatar, Card, CardContent, createTheme, Dialog, Divider, Grid, Rating, ThemeProvider, Typography } from "@mui/material"
import { Box } from "@mui/system"
import Footer from "../components/FooterComponent"
import GlobalRatingsGraphComponent from "../components/GlobalRatingsGraphComponent"
import TagComponent from "../components/TagComponent"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import WriteReviewComponent from "../components/WriteReviewComponent"
import SortReviewsComponent from "../components/SortReviewsComponent"
import Spinner from "../components/Spinner"
import PropTypes from "prop-types"
import ReviewUnderGameComponent from "../components/ReviewUnderGameComponent"
import ScrollableImageComponent from "../components/ScrollableImageComponent"

import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase.config"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"

import { SentimentVeryDissatisfied } from "@mui/icons-material"
import SpinnerComponent from "../components/SpinnerComponent"
import { checkGameCache } from "../helperFunctions/checkGameCache"

// Header font
const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

// props for the tab sections
function a11yProps(index) {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`
	}
}

// returns a tab panel that a user can click through
function TabPanel(props) {
	const { children, value, index, ...other } = props
	return (
		<div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography component={"span"}>{children}</Typography>
				</Box>
			)}
		</div>
	)
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired
}

/*
Displays a ConfirmationDialog of the WriteReviewComponent on top of the page. 
It cannot be closed unless the user clicks on
Cancel, Save Draft, or Submit
*/
function ConfirmationDialog(props) {
	const { onClose, value: valueProp, open, reviewexists, reviewdata, reviewid, loadreviews, similarGames, ...other } = props
	const handleCancel = () => {
		onClose()
	}
	return (
		<Dialog
			maxWidth={"50"}
			open={open}
			scroll="body"
			{...other}
			PaperProps={{
				style: {
					backgroundColor: "transparent",
					boxShadow: "none"
				}
			}}>
			<WriteReviewComponent
				gameTitleProp={props.gametitlecd}
				gameCoverProp={props.gamecovercd}
				gameReleaseDateProp={props.gamereleasedatecd}
				tags={props.reviewtagscd}
				cancelHandler={handleCancel}
				reviewData={reviewdata}
				reviewExists={reviewexists}
				reviewId={reviewid}
				loadReviews={loadreviews}
				gamePlatformsProp={props.availableplatformscd}
				similarGames={similarGames}
			/>
		</Dialog>
	)
}

// Prop types for ConfirmationDialog above
ConfirmationDialog.propTypes = {
	onClose: PropTypes.func.isRequired,
	open: PropTypes.bool.isRequired
}

// Returns GamePage design
function GamePage() {
	const [gameData, setGameData] = useState(null)
	const [gameCover, setGameCover] = useState("")
	const [gameReleaseDate, setGameReleaseDate] = useState("")
	const [gameDeveloper, setGameDeveloper] = useState("")
	const [gameGenres, setGameGenres] = useState([])
	const [gamePlatforms, setGamePlatforms] = useState([])
	const [gameScreenshots, setGameScreenshots] = useState([])
	const [similarGames, setSimilarGames] = useState([])
	const [loading, setLoading] = useState(true)

	// gameID param state logic
	const { gameID } = useParams()
	const [previousGameID, setPreviousGameID] = useState(null)

	// States and handlers for ConfirmationDialog
	const [open, setOpen] = useState(false)
	const { currentUser } = auth

	// state to be used if review does exist already
	const [reviewExists, setReviewExists] = useState(false)
	const [reviewData, setReviewData] = useState(null)
	const [reviewId, setReviewId] = useState(null)

	// flag to load reviews
	const [loadReviews, setLoadReviews] = useState(true)

	// Holds all the reviews for a game
	const [gameSpecificReviews, setGameSpecificReviews] = useState([])
	const [reviewsToShow, setReviewsToShow] = useState(true)

	// Holds all the following reviews for a game
	const [followingReviews, setFollowingReviews] = useState([])
	const [followingReviewToShow, setFollowingReviewToShow] = useState(true)

	const [globalRating, setGlobalRating] = useState(null)
	const [gameRatings, setGameRatings] = useState(null)

	// Holds all the tags for a review
	const [reviewTags, setReviewTags] = useState([])

	const [sortOption, setSortOption] = useState("Oldest")
	const [following, setFollowing] = useState([])
	const [min, setMin] = useState(0.0)
	const [max, setMax] = useState(5.0)

	const [value, setValue] = useState(0)

	// handler for changing the star mins and maxs
	const handleChange = (event, newValue) => {
		setValue(newValue)
	}

	const navigate = useNavigate()

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

	// // to render everytime gameID changes to fetch gameData again
	// useEffect(() => {
	// 	setGameData(null)
	// }, [gameID])

	useEffect(() => {
		if (previousGameID !== null && previousGameID !== gameID) {
			// Reload the entire page
			window.location.reload()
		}
		// Update previousGameID to the current gameID
		setPreviousGameID(gameID)
	}, [gameID, previousGameID])

	// use effect for grabbing game data
	useEffect(() => {
		let subscribed = true
		const fetchGameData = async () => {
			setLoading(true)
			const fetchedData = await checkGameCache([gameID])
			if (subscribed) {
				setGameData(fetchedData)
				setGameCover(fetchedData[0].cover.url.replace("t_thumb", "t_1080p"))
				setGamePlatforms(fetchedData[0].platforms.map((platform) => platform.name))
				setGameGenres(fetchedData[0].genres.map((genre) => genre.name))
				setSimilarGames(fetchedData[0].similar_games)

				// setting release date
				let tempRelDates = []
				fetchedData[0].release_dates.map((obj) => {
					tempRelDates.push(parseInt(obj.y) + 0)
				})

				const filtered = tempRelDates.filter(function (value) {
					return !Number.isNaN(value)
				})

				setGameReleaseDate(Math.min(...filtered))

				// setting game developer
				let tempDevArr = []
				if (fetchedData[0].hasOwnProperty("involved_companies")) {
					fetchedData[0].involved_companies.map((company) => {
						if (company.developer) tempDevArr.push(company.company.name)
					})
				}

				if (tempDevArr.length !== 0) setGameDeveloper(tempDevArr.join(", "))
				else setGameDeveloper("Unknown Developer")

				// setting screenshots
				if (fetchedData[0].hasOwnProperty("screenshots")) {
					let tempScreenshots = []
					for (let i = 0; i < fetchedData[0].screenshots.length; i++) {
						tempScreenshots.push(fetchedData[0].screenshots[i].url.replace("t_thumb", "t_1080p"))
					}
					setGameScreenshots(tempScreenshots)
				}
			}
		}

		if (!gameData) fetchGameData()

		return () => {
			subscribed = false
			setLoading(false)
		}
	}, [gameData])

	// use effect for showing all reviews for this game
	useEffect(() => {
		// Gets all tags for a review
		const getReviewTags = async () => {
			const reviewTagsDocRef = doc(db, "reviewTags", "tags")
			const docSnap = await getDoc(reviewTagsDocRef)

			let tempArr = await docSnap.get("tags")

			setReviewTags(tempArr)
		}

		// Gets all reviews for a game
		if (loadReviews) getGameSpecificReviewsIds()

		getReviewTags()
		// use effect for showing user's specific review
		checkIfUserReviewExists()
	}, [gameID, loadReviews])

	// get ids all of this game's reviews along with reviews from people you follow
	async function getGameSpecificReviewsIds() {
		const gameSpecificReviewsDocRef = doc(db, "gameSpecificReviews", gameID)
		const docSnap = await getDoc(gameSpecificReviewsDocRef)

		// get following array to know the user's followers
		const userRef = await doc(db, "users", currentUser.uid)
		const userSnap = await getDoc(userRef)
		const followingArr = await userSnap.get("following")

		let tempArrGameSpeReviews = []
		let tempArrFollowingReviews = []
		let tempArrFollowing = []

		// if there's reviews, set reviewsToShow to true
		if (docSnap.exists()) {
			setReviewsToShow(true)

			const gameSpecificReviewsIds = await docSnap.get("reviews").map((id) => id)

			setGlobalRating(docSnap.get("globalRating"))
			setGameRatings(docSnap.get("ratings"))

			for (let i = 0; i < gameSpecificReviewsIds.length; i++) {
				const reviewDocRef = await doc(db, "reviews", gameSpecificReviewsIds[i])
				const docSnap2 = await getDoc(reviewDocRef)

				const userInfoDocRef = await doc(db, "users", docSnap2.get("userId"))
				const docSnap3 = await getDoc(userInfoDocRef)

				// fill temp game specific reviews array
				tempArrGameSpeReviews.push({
					id: docSnap2.id,
					doc: docSnap2,
					profilePic: docSnap3.get("profilePic"),
					username: docSnap3.get("username"),
					name: docSnap3.get("name")
				})

				// fill temp following array
				if (followingArr.includes(docSnap2.get("userId"))) {
					tempArrFollowing.push(docSnap2.get("userId"))
					tempArrFollowingReviews.push({
						rating: docSnap2.get("rating"),
						profilePic: docSnap3.get("profilePic"),
						username: docSnap3.get("username"),
						name: docSnap3.get("name")
					})
				}
			}
		}
		// otherwise set it to false, this makes the spinner appear, then shows the
		// "no reviews to display" jsx rather than the other way around
		else {
			setReviewsToShow(false)
		}

		setGameSpecificReviews(tempArrGameSpeReviews)
		setLoadReviews(false)

		if (tempArrFollowingReviews.length === 0) setFollowingReviewToShow(false)

		setFollowingReviews(tempArrFollowingReviews)
		setFollowing(tempArrFollowing)
	}

	// checks if this user has rated this game already
	async function checkIfUserReviewExists() {
		const userRef = doc(db, "users", currentUser.uid)
		const userSnap = await getDoc(userRef)
		const reviews = userSnap.data().reviews
		reviews.forEach(async (review) => {
			const reviewRef = doc(db, "reviews", review)
			const reviewSnap = await getDoc(reviewRef)
			if (reviewSnap.data().gameId === gameID) {
				setReviewExists(true)
				setReviewData(reviewSnap.data())
				setReviewId(reviewSnap.id)
			}
		})
	}

	// reloader callback for review deletion
	async function reloadReviews() {
		await getGameSpecificReviewsIds()
		await checkIfUserReviewExists()
	}

	// JSX for showing all reviews for a game. appends to a list in html format
	function ShowAllReviews() {
		if (reviewsToShow) {
			// if there's any reviews to show
			if (gameSpecificReviews && gameSpecificReviews.length !== 0) {
				const rows = []
				let tempArr = gameSpecificReviews
				switch (sortOption) {
					case "Oldest":
						gameSpecificReviews.sort((a, b) => a.doc.get("createdAt") - b.doc.get("createdAt"))
						break
					case "Newest":
						gameSpecificReviews.sort((a, b) => b.doc.get("createdAt") - a.doc.get("createdAt"))
						break
					case "Highest Rated":
						gameSpecificReviews.sort((a, b) => b.doc.get("rating") - a.doc.get("rating"))
						break
					case "Lowest Rated":
						gameSpecificReviews.sort((a, b) => a.doc.get("rating") - b.doc.get("rating"))
						break
					case "Controversial":
						gameSpecificReviews.sort(
							(a, b) =>
								a.doc.get("upvotes").length - a.doc.get("downvotes").length - (b.doc.get("upvotes").length - b.doc.get("downvotes").length)
						)
						break
					case "Following":
						//gameSpecificReviews.sort((a, b) => (following.includes(b.doc.get("userId")) - following.includes(a.doc.get("userId"))))
						tempArr = []
						for (let i = 0; i < gameSpecificReviews.length; i++) {
							if (following.includes(gameSpecificReviews[i].doc.get("userId"))) {
								tempArr.push(gameSpecificReviews[i])
							}
						}
						break
					case "Star Range":
						tempArr = []
						for (let i = 0; i < gameSpecificReviews.length; i++) {
							let rating = gameSpecificReviews[i].doc.get("rating")
							if (rating >= min && rating <= max) {
								tempArr.push(gameSpecificReviews[i])
							}
						}
						break
					case "Tags":
						gameSpecificReviews.sort(
							(b, a) =>
								a.doc.get("positiveAttributes").length +
								a.doc.get("negativeAttributes").length -
								(b.doc.get("positiveAttributes").length - b.doc.get("negativeAttributes").length)
						)
						break
				}

				for (let i = 0; i < gameSpecificReviews.length; i++) {
					if (gameSpecificReviews[i]) {
						if (gameSpecificReviews[i].doc.get("review") === "") continue
						if (!tempArr.includes(gameSpecificReviews[i])) continue
					}

					gameSpecificReviews[i] &&
						rows.push(
							<Grid item xs={12} key={i}>
								<ReviewUnderGameComponent
									key={i}
									id={gameSpecificReviews[i].id}
									userId={gameSpecificReviews[i].doc.get("userId")}
									reviewText={gameSpecificReviews[i].doc.get("review")}
									rating={gameSpecificReviews[i].doc.get("rating")}
									platform={gameSpecificReviews[i].doc.get("platform")}
									hoursPlayed={gameSpecificReviews[i].doc.get("hoursPlayed")}
									timesCompleted={gameSpecificReviews[i].doc.get("timesCompleted")}
									positiveAttributes={gameSpecificReviews[i].doc.get("positiveAttributes")}
									negativeAttributes={gameSpecificReviews[i].doc.get("negativeAttributes")}
									upvotes={gameSpecificReviews[i].doc.get("upvotes")}
									downvotes={gameSpecificReviews[i].doc.get("downvotes")}
									containsSpoiler={gameSpecificReviews[i].doc.get("containsSpoiler")}
									gameId={gameSpecificReviews[i].doc.get("gameId")}
									username={gameSpecificReviews[i].username}
									name={gameSpecificReviews[i].name}
									profilePic={gameSpecificReviews[i].profilePic}
									gameCover={gameSpecificReviews[i].doc.get("gameCover")}
									gameTitle={gameSpecificReviews[i].doc.get("gameTitle")}
									gameReleaseDate={gameSpecificReviews[i].doc.get("gameReleaseDate")}
									reloadReviews={reloadReviews}
									comments={gameSpecificReviews[i].doc.get("comments")}
									createdAt={gameSpecificReviews[i].doc.get("createdAt")}
								/>
							</Grid>
						)
				}
				return <>{rows.length !== 0 ? rows : <NoReviewsJSX />}</>
			} else {
				return (
					<Card
						className="card"
						sx={{
							boxShadow: "0px 0px 15px #0f0f0f",
							background: "linear-gradient(#2e2e2e, transparent)",
							color: "#ffffff",
							width: "auto",
							borderRadius: 3,
							mb: 5,
							maxWidth: 800,
							mr: 1,
							ml: 1
						}}>
						<CardContent>
							<SpinnerComponent override={{ position: "relative", margin: "50px" }} />
						</CardContent>
					</Card>
				)
			}
		} else {
			// otherwise say there's nothing to display with a frowny face :(
			return (
				<>
					<NoReviewsJSX />
				</>
			)
		}
	}

	// JSX for showing all following reviews. appends to a list in html format
	function ShowFollowingReviews() {
		if (followingReviewToShow) {
			// if there's any reviews to show
			if (followingReviews && followingReviews.length !== 0) {
				const rows = []

				for (let i = 0; i < followingReviews.length; i++) {
					followingReviews[i] &&
						rows.push(
							<Grid container key={i} align="left" mb={1} mt={2}>
								<Grid item xs={3} align="center">
									<Avatar
										alt="username"
										src={followingReviews[i].profilePic}
										sx={{ height: 40, width: 40, "&:hover": { cursor: "pointer", boxShadow: "0px 0px 13px #4C2F97" } }}
										onClick={() => navigate(`/${followingReviews[i].username}`)}
									/>
								</Grid>
								<Grid item xs={8} align="left">
									<Grid container>
										<Grid item xs={12} align="left">
											<Typography fontSize={"14px"}>{followingReviews[i].name} rated this</Typography>
										</Grid>

										<Grid item xs={5.5} sm={4.5} md={5.5} align="left">
											<Typography fontSize={"14px"}>
												{followingReviews[i].rating} {followingReviews[i].rating === 1 ? "Star" : "Stars"}
											</Typography>
										</Grid>

										<Grid item xs={6.5} sm={7.5} md={6.5} align="left">
											<Rating
												value={followingReviews[i].rating}
												size="small"
												precision={0.5}
												sx={{
													ml: followingReviews[i].rating % 1 === 0 ? -3 : -1.5,
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
							</Grid>
						)
				}
				return <>{rows.length !== 0 ? rows : <NoReviewsJSX />}</>
			} else {
				return (
					<Grid item xs={12}>
						<Card className="card" sx={{ bgcolor: "#252525", color: "#ffffff", width: "auto", borderRadius: 3, mb: 5, maxWidth: 800 }}>
							<CardContent>
								<SpinnerComponent override={{ position: "relative", margin: "50px" }} />
							</CardContent>
						</Card>
					</Grid>
				)
			}
		} else {
			// otherwise say there's nothing to display with a frowny face :(
			return (
				<Grid item xs={10} mt={2} mb={2}>
					<SentimentVeryDissatisfied fontSize="large" />
					<ThemeProvider theme={theme}>
						<Typography>
							No one you follow has
							<br />
							rated this game yet!
						</Typography>
					</ThemeProvider>
				</Grid>
			)
		}
	}

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

	// returns a "no review to display" component with frowny face :(
	const NoReviewsJSX = () => {
		return (
			<Card
				sx={{
					background: "transparent",
					color: "#fff",
					width: "auto",
					maxWidth: 800
				}}>
				<CardContent>
					<SentimentVeryDissatisfied fontSize="large" />
					<ThemeProvider theme={theme}>
						<Typography>No Reviews to Display</Typography>
					</ThemeProvider>
				</CardContent>
			</Card>
		)
	}

	// handler for opening WriteReviewComponent
	const handleClickOpen = () => {
		setOpen(true)
	}

	// handler for closing WriteReviewComponent
	const handleClose = () => {
		setOpen(false)
	}

	// Takes in a list of genres and returns a JSX formated version of it
	const listGenres = gameGenres.map((string) => (
		<Grid item xs={3.5} key={string.toString()}>
			<TagComponent tagWidth={110} text={string} />
		</Grid>
	))

	if (loading) return <Spinner />

	return (
		<>
			<div className="content-wrapper">
				<Navbar />
				<SideNav />
				{/* Dialog box that appears when "Write a Review..." is clicked.
			It opens the Write Review Component on top of the page */}
				{reviewExists !== null ? (
					<ConfirmationDialog
						keepMounted
						open={open}
						onClose={handleClose}
						gametitlecd={gameData && gameData[0].name}
						gamecovercd={gameCover}
						gamereleasedatecd={gameReleaseDate}
						reviewtagscd={reviewTags}
						reviewexists={reviewExists}
						reviewdata={reviewData}
						reviewid={reviewId}
						loadreviews={setLoadReviews}
						availableplatformscd={gamePlatforms}
						similarGames={similarGames}
					/>
				) : (
					<></>
				)}

				{/* Overall container for the page, 3 columns long */}
				<Grid container align="center">
					<Grid align="center" item xs={12}>
						<Grid container rowSpacing={1} align="center" columnSpacing={2} sx={{ mt: 3, paddingBottom: 8 }} maxWidth={1100}>
							{/* Box art */}
							<Grid item xs={12} md={3} align={"center"}>
								<Box
									component="img"
									sx={{
										backgroundColor: "#FFF",
										borderRadius: 2,
										mb: 2,
										maxWidth: 250,
										minWidth: 100,
										width: "auto",
										height: "auto"
									}}
									src={gameCover}></Box>
								<PlatformComponent platforms={gamePlatforms} />
							</Grid>

							{/* description, genres, and screenshots */}
							<Grid item xs={12} md={6} align="center">
								<Grid borderRadius={2} align="center" className="box" maxHeight={500} minHeight={335} height="auto">
									<ThemeProvider theme={theme}>
										<Typography align="left" mx={2} color="#fff" fontSize={"40px"}>
											{gameData && gameData[0].name}
										</Typography>
									</ThemeProvider>
									<Typography align="left" mx={2} color="#fff">
										{gameReleaseDate} Developed by: {gameDeveloper}
									</Typography>
									<Box sx={{ width: "100%" }} mb={3}>
										<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
											<Tabs value={value} onChange={handleChange} textColor="inherit">
												<Tab label="Description" {...a11yProps(0)} />
												<Tab label="Genres" {...a11yProps(1)} />
												<Tab label="Screenshots" {...a11yProps(2)} />
											</Tabs>
										</Box>

										<TabPanel value={value} index={0} sx={{ width: "auto", maxWidth: 915 }}>
											<Box sx={{}}>
												<Typography
													align="left"
													color="#fff"
													sx={{
														overflow: "auto",
														display: "-webkit-box",
														WebkitLineClamp: "6",
														WebkitBoxOrient: "vertical"
													}}>
													{gameData && gameData[0].summary}
												</Typography>
											</Box>
										</TabPanel>

										<TabPanel value={value} index={1} sx={{ width: "auto", maxWidth: 915 }}>
											<Box
												sx={{
													overflow: "auto",
													maxHeight: 200
												}}>
												<Grid container mt={0} rowSpacing={2} spacing={12}>
													{listGenres}
												</Grid>
											</Box>
										</TabPanel>

										<TabPanel value={value} index={2} sx={{ width: "auto", maxWidth: 915 }}>
											<ScrollableImageComponent screenshots={gameScreenshots}></ScrollableImageComponent>
										</TabPanel>
									</Box>
								</Grid>

								{/* Game Specific Reviews */}
								{/* next row, reviews listed under game */}
								<Grid align={"center"} item xs={12} mt={2.5}>
									<Grid className="box" sx={{ borderRadius: 2, maxWidth: 915, paddingBottom: 1 }}>
										<SortReviewsComponent
											sortingTextLen={10}
											sortByLen={2}
											dividerLen={12}
											setSortOption={setSortOption}
											setMin={setMin}
											setMax={setMax}
											min={min}
											max={max}
											showFollowingOption={true}
											showContoversialOption={true}
											showTagsOption={true}
										/>
										<ShowAllReviews />
									</Grid>
								</Grid>
							</Grid>

							{/* Action box */}
							<Grid item xs={12} md={3} mt={2} alight="center">
								<ActionBox
									writeReviewHandler={handleClickOpen}
									reviewExists={reviewExists}
									reviewId={reviewExists ? reviewId : null}
									rating={reviewExists ? reviewData.rating : 0}
									gameTitle={gameData && gameData[0].name}
									gameCover={gameCover}
									gameReleaseDate={gameReleaseDate}
									loadReviews={setLoadReviews}
									similarGames={similarGames}
									likedProp={reviewExists ? reviewData.liked : false}
								/>

								{/* Global ratings */}
								<Grid item mt={3} alight="left">
									<GlobalRatingsGraphComponent gameRatings={gameRatings} globalRating={globalRating} />
								</Grid>

								{/* Reviews by people you follow */}
								<Grid item xs={12} mt={3}>
									<Grid className="box" container sx={{ borderRadius: 2 }} maxWidth={250} minWidth={100}>
										<Grid item xs={12} align="center">
											<ThemeProvider theme={theme}>
												<Typography variant="h6" align="center" color="#FFFFFF" mt={2}>
													Ratings from users
													<br />
													you follow
												</Typography>
											</ThemeProvider>
											<Divider sx={{ borderBottomWidth: 2, mt: 1, mr: 1, ml: 1, mb: 1, bgcolor: "#a3a3a3" }} />
											<ShowFollowingReviews />
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<ToastContainer />
			</div>
			<Footer />
		</>
	)
}

export default GamePage
