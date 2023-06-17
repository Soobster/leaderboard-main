/*
The BadgesComponent. Displays badges at the bottom of a user's profile info section. A total of 6 badges
are displayed, each representing the total stats of different features the user has interacted with.

There are 4 tiers to each badge: Base, Bronze, Silver and Gold. Clicking on the "See Progress" button
opens a dialog box displaying the user's current badges, and their progress to achieve the next badge.
If the user has achieved gold rank for a badge, the progress bar will be full and a purple check will
be displayed.

Hovering over a badge will display a tooltip indicating the current stat count of that badge.

*/

import React, { useEffect, useState } from "react"
import { auth, db } from "../firebase.config"
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore"
import {
	Grid,
	Typography,
	ThemeProvider,
	Button,
	createTheme,
	Dialog,
	DialogTitle,
	DialogContentText,
	DialogActions,
	DialogContent,
	LinearProgress,
	Tooltip,
	Zoom
} from "@mui/material"
import "../App.css"
import bookmarkBrz from "../assets/Badges/Bookmark-Bronze.png"
import bookmarkSlv from "../assets/Badges/Bookmark-Silver.png"
import bookmarkGld from "../assets/Badges/Bookmark-Gold.png"
import followerBrz from "../assets/Badges/Followers-Bronze.png"
import followerSlv from "../assets/Badges/Followers-Silver.png"
import followerGld from "../assets/Badges/Followers-Gold.png"
import listBrz from "../assets/Badges/Lists-Bronze.png"
import listSlv from "../assets/Badges/Lists-Silver.png"
import listGld from "../assets/Badges/Lists-Gold.png"
import likesBrz from "../assets/Badges/Liked-Bronze.png"
import likesSlv from "../assets/Badges/Liked-Silver.png"
import likesGld from "../assets/Badges/Liked-Gold.png"
import allLikesBrz from "../assets/Badges/AllLikes-Bronze.png"
import allLikesSlv from "../assets/Badges/AllLikes-Silver.png"
import allLikesGld from "../assets/Badges/AllLikes-Gold.png"
import reviewsBrz from "../assets/Badges/ReviewsWritten-Bronze.png"
import reviewsSlv from "../assets/Badges/ReviewsWritten-Silver.png"
import reviewsGld from "../assets/Badges/ReviewsWritten-Gold.png"
import noBadge from "../assets/Badges/NoBadge.png"
import empty from "../assets/Badges/EmptyBadge.png"
import birthday from "../assets/Badges/Birthday.png"

import reviewsBase from "../assets/Badges/ReviewsWrittenBase.png"
import likesBase from "../assets/Badges/LikedBase.png"
import allLikesBase from "../assets/Badges/AllLikesBase.png"
import followerBase from "../assets/Badges/FollowersBase.png"
import listBase from "../assets/Badges/ListsBase.png"
import bookmarkBase from "../assets/Badges/BookmarkBase.png"
import check from "../assets/Badges/Check.png"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function BadgesComponent({ userData, isUser }) {
	const reviewsGoals = [0, 5, 15, 30, null]
	const followersGoals = [0, 3, 10, 20, null]
	const highLikesGoals = [0, 5, 15, 30, null]
	const totalLikesGoals = [0, 15, 30, 50, null]
	const listsGoals = [0, 3, 10, 20, null]
	const backlogGoals = [0, 5, 15, 30, null]

	const [reviewTier, setReviewTier] = useState(0)
	const [followerTier, setFollowerTier] = useState(0)
	const [highestLikesTier, setHighestLikesTier] = useState(0)
	const [totalLikesTier, setTotalLikesTier] = useState(0)
	const [listsTier, setListsTier] = useState(0)
	const [backlogTier, setBacklogTier] = useState(0)

	const reviewGroup = [reviewsBase, reviewsBrz, reviewsSlv, reviewsGld, check]
	const followerGroup = [followerBase, followerBrz, followerSlv, followerGld, check]
	const highestLikesGroup = [likesBase, likesBrz, likesSlv, likesGld, check]
	const totalLikesGroup = [allLikesBase, allLikesBrz, allLikesSlv, allLikesGld, check]
	const listGroup = [listBase, listBrz, listSlv, listGld]
	const backlogGroup = [bookmarkBase, bookmarkBrz, bookmarkSlv, bookmarkGld, check]

	const [numBacklogs, setNumBacklogs] = useState(0)
	const [numFollowers, setNumFollowers] = useState(0)
	const [numLists, setNumLists] = useState(0)
	const [numReviews, setNumReviews] = useState(0)
	const [allLikes, setAllLikes] = useState(0)
	const [highestLikes, setHighestLikes] = useState(0)

	const [openBadgeSelect, setOpenBadgeSelect] = useState(false)
	const [badge1, setBadge1] = useState(reviewsBase)
	const [badge2, setBadge2] = useState(likesBase)
	const [badge3, setBadge3] = useState(allLikesBase)
	const [badge4, setBadge4] = useState(followerBase)
	const [badge5, setBadge5] = useState(listBase)
	const [badge6, setBadge6] = useState(bookmarkBase)

	const { currentUser } = auth
	const userID = currentUser.uid

	// Run on page render
	useEffect(() => {
		// Get user badge data from firebase
		const getBadges = async () => {
			const userRef = await doc(db, "users", `${userData.id}`)
			const userSnap = await getDoc(userRef)

			// Get and store user stats (except upvotes)
			setNumBacklogs(userSnap.get("backlog").length)
			setNumFollowers(userSnap.get("followers").length)
			setNumLists(userSnap.get("lists").length + userSnap.get("tierlists").length)
			setNumReviews(userSnap.get("reviews").length)

			// Set tier level based on gathered data
			setReviewTier(setTier(numReviews, reviewsGoals))
			setBacklogTier(setTier(numBacklogs, backlogGoals))
			setTotalLikesTier(setTier(allLikes, totalLikesGoals))
			setHighestLikesTier(setTier(highestLikes, highLikesGoals))
			setListsTier(setTier(numLists, listsGoals))
			setFollowerTier(setTier(numFollowers, followersGoals))

			// Update database
			updateDatabase("badge1", convertBadgeToString(reviewGroup[reviewTier]))
			updateDatabase("badge4", convertBadgeToString(followerGroup[followerTier]))
			updateDatabase("badge5", convertBadgeToString(listGroup[listsTier]))
			updateDatabase("badge6", convertBadgeToString(backlogGroup[backlogTier]))

			// Set Display
			setBadge1(reviewGroup[reviewTier])
			setBadge4(followerGroup[followerTier])
			setBadge5(listGroup[listsTier])
			setBadge6(backlogGroup[backlogTier])

			let tempHighestLikes = 0
			let tempAllLikes = 0

			// Create and run queries for upvotes on reviews, lists and tierlists
			// Store separate values for total upvotes and highest single upvote count
			const reviewQuery = query(collection(db, "reviews"), where("userId", "==", `${userData.id}`))
			const reviewSnap = await getDocs(reviewQuery)

			const listQuery = query(collection(db, "lists"), where("userId", "==", `${userData.id}`))
			const listSnap = await getDocs(listQuery)

			const tierListQuery = query(collection(db, "tierlists"), where("userId", "==", `${userData.id}`))
			const tierListSnap = await getDocs(tierListQuery)

			reviewSnap.forEach((doc) => {
				tempAllLikes += doc.data().upvotes.length
				if (tempHighestLikes < doc.data().upvotes.length) {
					tempHighestLikes = doc.data().upvotes.length
				}
			})

			listSnap.forEach((doc) => {
				tempAllLikes += doc.data().upvotes.length
				if (tempHighestLikes < doc.data().upvotes.length) {
					tempHighestLikes = doc.data().upvotes.length
				}
			})

			tierListSnap.forEach((doc) => {
				tempAllLikes += doc.data().upvotes.length
				if (tempHighestLikes < doc.data().upvotes.length) {
					tempHighestLikes = doc.data().upvotes.length
				}
			})

			setHighestLikes(tempHighestLikes)
			setAllLikes(tempAllLikes)

			updateDatabase("badge2", convertBadgeToString(highestLikesGroup[highestLikesTier]))
			updateDatabase("badge3", convertBadgeToString(totalLikesGroup[totalLikesTier]))

			setBadge2(highestLikesGroup[highestLikesTier])
			setBadge3(totalLikesGroup[totalLikesTier])
		}

		// Get user upvote statistics
		// const getLikesBadges = async () => {

		// }

		getBadges()
		// getLikesBadges()
	})

	const convertBadgeToString = (badge) => {
		switch (badge) {
			case bookmarkBrz:
				return "bookmarkBrz"
			case bookmarkSlv:
				return "bookmarkSlv"
			case bookmarkGld:
				return "bookmarkGld"
			case followerBrz:
				return "followerBrz"
			case followerSlv:
				return "followerSlv"
			case followerGld:
				return "followerGld"
			case listBrz:
				return "listBrz"
			case listSlv:
				return "listSlv"
			case listGld:
				return "listGld"
			case likesBrz:
				return "likesBrz"
			case likesSlv:
				return "likesSlv"
			case likesGld:
				return "likesGld"
			case allLikesBrz:
				return "allLikesBrz"
			case allLikesSlv:
				return "allLikesSlv"
			case allLikesGld:
				return "allLikesGld"
			case reviewsBrz:
				return "reviewsBrz"
			case reviewsSlv:
				return "reviewsSlv"
			case reviewsGld:
				return "reviewsGld"
			case birthday:
				return "birthday"
			case noBadge:
				return "noBadge"
			case reviewsBase:
				return "reviewsBase"
			case likesBase:
				return "likesBase"
			case allLikesBase:
				return "allLikesBase"
			case followerBase:
				return "followerBase"
			case listBase:
				return "listBase"
			case bookmarkBase:
				return "bookmarkBase"
			case check:
				return "check"
			default:
				return "empty"
		}
	}

	// Upon selecting a badge, update data in firebase
	const updateDatabase = async (currSlot, chosenBadge) => {
		const userRef = await doc(db, "users", userID)
		if (currSlot === "badge1") {
			await updateDoc(userRef, { "badges.0": chosenBadge })
		} else if (currSlot === "badge2") {
			await updateDoc(userRef, { "badges.1": chosenBadge })
		} else if (currSlot === "badge3") {
			await updateDoc(userRef, { "badges.2": chosenBadge })
		} else if (currSlot === "badge4") {
			await updateDoc(userRef, { "badges.3": chosenBadge })
		} else if (currSlot === "badge5") {
			await updateDoc(userRef, { "badges.4": chosenBadge })
		} else if (currSlot === "badge6") {
			await updateDoc(userRef, { "badges.5": chosenBadge })
		}
	}

	// Close badge selection dialog
	const handleCloseBadgeSelect = () => {
		setOpenBadgeSelect(false)
	}

	// Open badge selection dialog & set chosen slot
	const handleOpenBadgeSelect = (chosenSlot) => {
		setOpenBadgeSelect(true)
	}

	// Set individual stats to corrosponding tiers
	const setTier = (statCount, goalArray) => {
		if (statCount >= goalArray[3]) {
			return 3
		} else if (statCount >= goalArray[2]) {
			return 2
		} else if (statCount >= goalArray[1]) {
			return 1
		} else {
			return 0
		}
	}

	// Helper function to calculate progress bar value for badges
	function calculateProgress(statCount, statTier, statGoals) {
		if (statTier === 3) return 100
		return ((statCount - statGoals[statTier]) / (statGoals[statTier + 1] - statGoals[statTier])) * 100
	}

	return (
		<>
			<Dialog
				onClose={handleCloseBadgeSelect}
				open={openBadgeSelect}
				scroll="body"
				width="auto"
				maxWidth="400"
				PaperProps={{
					style: {
						backgroundColor: "transparent",
						boxShadow: "none"
					}
				}}>
				<DialogTitle id="alert-dialog-title" sx={{ bgcolor: "#252525", color: "#FFF" }}>
					{"Badge Progress"}
				</DialogTitle>
				<DialogContent sx={{ bgcolor: "#252525" }}>
					<Grid container rowSpacing={2} maxWidth={400}>
						{/* Review badge */}
						<Grid item xs={2.75} mt={1}>
							<img src={reviewGroup[reviewTier]} alt="badge1" width={75} height={75} />
						</Grid>
						<Grid item xs={6}>
							<DialogContentText id="badge-description" sx={{ color: "#FFFFFF" }} fontFamily={"Josefin Sans"} fontSize={20} mt={1}>
								Reviews Made
							</DialogContentText>
							<LinearProgress
								sx={{ backgroundColor: "#D3C4FB", "& .MuiLinearProgress-bar": { backgroundColor: "#4C2F97" } }}
								variant="determinate"
								value={calculateProgress(numReviews, reviewTier, reviewsGoals)}
							/>
							<Grid container>
								<Grid item xs={6}>
									<Typography align={"left"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{reviewsGoals[reviewTier]}
									</Typography>
								</Grid>
								<Grid item xs={6}>
									<Typography align={"right"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{reviewsGoals[reviewTier + 1]}
									</Typography>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={2} ml={1}>
							<img src={reviewGroup[reviewTier + 1]} alt="badge1" width={90} height={90} />
						</Grid>

						{/* Highest Likes badge */}
						<Grid item xs={2.75} mt={1}>
							<img src={highestLikesGroup[highestLikesTier]} alt="badge1" width={75} height={75} />
						</Grid>
						<Grid item xs={6}>
							<DialogContentText id="badge-description" sx={{ color: "#FFFFFF" }} fontFamily={"Josefin Sans"} fontSize={20} mt={1}>
								Most Liked Post
							</DialogContentText>
							<LinearProgress
								sx={{ backgroundColor: "#D3C4FB", "& .MuiLinearProgress-bar": { backgroundColor: "#4C2F97" } }}
								variant="determinate"
								value={calculateProgress(highestLikes, highestLikesTier, highLikesGoals)}
							/>
							<Grid container>
								<Grid item xs={6}>
									<Typography align={"left"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{highLikesGoals[highestLikesTier]}
									</Typography>
								</Grid>
								<Grid item xs={6}>
									<Typography align={"right"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{highLikesGoals[highestLikesTier + 1]}
									</Typography>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={2} ml={1}>
							<img src={highestLikesGroup[highestLikesTier + 1]} alt="badge1" width={90} height={90} />
						</Grid>

						{/* Total Likes badge */}
						<Grid item xs={2.75} mt={1}>
							<img src={totalLikesGroup[totalLikesTier]} alt="badge1" width={75} height={75} />
						</Grid>
						<Grid item xs={6}>
							<DialogContentText id="badge-description" sx={{ color: "#FFFFFF" }} fontFamily={"Josefin Sans"} fontSize={20} mt={1}>
								Total Likes Received
							</DialogContentText>
							<LinearProgress
								sx={{ backgroundColor: "#D3C4FB", "& .MuiLinearProgress-bar": { backgroundColor: "#4C2F97" } }}
								variant="determinate"
								value={calculateProgress(allLikes, totalLikesTier, totalLikesGoals)}
							/>
							<Grid container>
								<Grid item xs={6}>
									<Typography align={"left"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{totalLikesGoals[totalLikesTier]}
									</Typography>
								</Grid>
								<Grid item xs={6}>
									<Typography align={"right"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{totalLikesGoals[totalLikesTier + 1]}
									</Typography>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={2} ml={1}>
							<img src={totalLikesGroup[totalLikesTier + 1]} alt="badge1" width={90} height={90} />
						</Grid>

						{/* Followers badge */}
						<Grid item xs={2.75} mt={1}>
							<img src={followerGroup[followerTier]} alt="badge1" width={75} height={75} />
						</Grid>
						<Grid item xs={6}>
							<DialogContentText id="badge-description" sx={{ color: "#FFFFFF" }} fontFamily={"Josefin Sans"} fontSize={20} mt={1}>
								Followers
							</DialogContentText>
							<LinearProgress
								sx={{ backgroundColor: "#D3C4FB", "& .MuiLinearProgress-bar": { backgroundColor: "#4C2F97" } }}
								variant="determinate"
								value={calculateProgress(numFollowers, followerTier, followersGoals)}
							/>
							<Grid container>
								<Grid item xs={6}>
									<Typography align={"left"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{followersGoals[followerTier]}
									</Typography>
								</Grid>
								<Grid item xs={6}>
									<Typography align={"right"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{followersGoals[followerTier + 1]}
									</Typography>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={2} ml={1}>
							<img src={followerGroup[followerTier + 1]} alt="badge1" width={90} height={90} />
						</Grid>

						{/* List badge */}
						<Grid item xs={2.75} mt={1}>
							<img src={listGroup[listsTier]} alt="badge1" width={75} height={75} />
						</Grid>
						<Grid item xs={6}>
							<DialogContentText id="badge-description" sx={{ color: "#FFFFFF" }} fontFamily={"Josefin Sans"} fontSize={20} mt={1}>
								Lists Created
							</DialogContentText>
							<LinearProgress
								sx={{ backgroundColor: "#D3C4FB", "& .MuiLinearProgress-bar": { backgroundColor: "#4C2F97" } }}
								variant="determinate"
								value={calculateProgress(numLists, listsTier, listsGoals)}
							/>
							<Grid container>
								<Grid item xs={6}>
									<Typography align={"left"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{listsGoals[listsTier]}
									</Typography>
								</Grid>
								<Grid item xs={6}>
									<Typography align={"right"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{listsGoals[listsTier + 1]}
									</Typography>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={2} ml={1}>
							<img src={listGroup[listsTier + 1]} alt="badge1" width={90} height={90} />
						</Grid>

						{/* Backlog badge */}
						<Grid item xs={2.75} mt={1}>
							<img src={backlogGroup[backlogTier]} alt="badge1" width={75} height={75} />
						</Grid>
						<Grid item xs={6}>
							<DialogContentText id="badge-description" sx={{ color: "#FFFFFF" }} fontFamily={"Josefin Sans"} fontSize={20} mt={1}>
								Games in Backlog
							</DialogContentText>
							<LinearProgress
								sx={{ backgroundColor: "#D3C4FB", "& .MuiLinearProgress-bar": { backgroundColor: "#4C2F97" } }}
								variant="determinate"
								value={calculateProgress(numBacklogs, backlogTier, backlogGoals)}
							/>
							<Grid container>
								<Grid item xs={6}>
									<Typography align={"left"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{backlogGoals[backlogTier]}
									</Typography>
								</Grid>
								<Grid item xs={6}>
									<Typography align={"right"} color={"#FFF"} fontFamily={"Josefin Sans"} fontSize={14}>
										{backlogGoals[backlogTier + 1]}
									</Typography>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={2} ml={1}>
							<img src={backlogGroup[backlogTier + 1]} alt="badge1" width={90} height={90} />
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions sx={{ bgcolor: "#252525" }}>
					<Button onClick={() => handleCloseBadgeSelect()} sx={{ color: "#FFF" }}>
						Close
					</Button>
				</DialogActions>
			</Dialog>

			<Grid borderRadius={3} container rowSpacing={2} sx={{ mt: 3, width: "auto", maxWidth: "100%", height: 109, maxHeight: 109 }}>
				<Grid item xs={12} md={1.6} mt={1} ml={2} sx={{ mt: { xs: 2.5, md: 1 } }}>
					<ThemeProvider theme={theme}>
						<Typography variant="h5" sx={{ flexGrow: 1 }}>
							Badges:
						</Typography>
					</ThemeProvider>
					<Button
						sx={{
							mt: 0.25,
							flexGrow: 1,
							borderRadius: 2,
							background: "linear-gradient(#313131,#252525)",
							color: "#aaa",
							boxShadow: "0px 0px 15px #151515",
							"&:hover": { color: "#fff", background: "linear-gradient(#4f319b,#362269)" }
						}}
						onClick={() => handleOpenBadgeSelect("none")}>
						<Typography sx={{ mb: -0.25, fontSize: 13, textTransform: "none" }}>See progress</Typography>
					</Button>
				</Grid>

				<Grid item xs={4} md={1.6} sx={{ align: { xs: "center", md: "left" } }} align={"center"} mt={-1}>
					<Tooltip
						title={
							<React.Fragment>
								<Typography color="inherit">Reviews Made: {numReviews}</Typography>
							</React.Fragment>
						}
						arrow
						placement="top"
						TransitionComponent={Zoom}>
						<img src={badge1} alt="badge1" width={90} height={90} />
					</Tooltip>
				</Grid>

				<Grid item xs={4} md={1.6} sx={{ align: { xs: "center", md: "left" } }} align={"center"} mt={-1}>
					<Tooltip
						title={
							<React.Fragment>
								<Typography color="inherit">Most Liked Post: {highestLikes}</Typography>
							</React.Fragment>
						}
						arrow
						placement="top"
						TransitionComponent={Zoom}>
						<img src={badge2} alt="badge2" width={90} height={90} />
					</Tooltip>
				</Grid>

				<Grid item xs={4} md={1.6} sx={{ align: { xs: "center", md: "left" } }} align={"center"} mt={-1}>
					<Tooltip
						title={
							<React.Fragment>
								<Typography color="inherit">Total Likes Received: {allLikes}</Typography>
							</React.Fragment>
						}
						arrow
						placement="top"
						TransitionComponent={Zoom}>
						<img src={badge3} alt="badge3" width={90} height={90} />
					</Tooltip>
				</Grid>

				<Grid item xs={4} md={1.6} sx={{ align: { xs: "center", md: "left" } }} align={"center"} mt={-1}>
					<Tooltip
						title={
							<React.Fragment>
								<Typography color="inherit">Followers: {numFollowers}</Typography>
							</React.Fragment>
						}
						arrow
						placement="top"
						TransitionComponent={Zoom}>
						<img src={badge4} alt="badge4" width={90} height={90} />
					</Tooltip>
				</Grid>

				<Grid item xs={4} md={1.6} sx={{ align: { xs: "center", md: "left" } }} align={"center"} mt={-1}>
					<Tooltip
						title={
							<React.Fragment>
								<Typography color="inherit">Lists Created: {numLists}</Typography>
							</React.Fragment>
						}
						arrow
						placement="top"
						TransitionComponent={Zoom}>
						<img src={badge5} alt="badge5" width={90} height={90} />
					</Tooltip>
				</Grid>

				<Grid item xs={4} md={1.6} sx={{ align: { xs: "center", md: "left" } }} align={"center"} mt={-1}>
					<Tooltip
						title={
							<React.Fragment>
								<Typography color="inherit">Games in Backlog: {numBacklogs}</Typography>
							</React.Fragment>
						}
						arrow
						placement="top"
						TransitionComponent={Zoom}>
						<img src={badge6} alt="badge6" width={90} height={90} />
					</Tooltip>
				</Grid>
			</Grid>
		</>
	)
}

export default BadgesComponent
