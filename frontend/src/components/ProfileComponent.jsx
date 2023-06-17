/*
The ProfileComponent. It displays some of the user's information as well as Leaderboard activity.

This will display the user's name, username, bio and profile picture. In addition, it displays
the amount of followers and following, and if they are clicked, it shows a list of these users.
It also displays the amount of games reviewed and lists created, and their favorite game.
Finally, it displays the badges this user has achieved, and if the 'See progress' button is clicked,
it displays their progress in these badges and the next badge they could accomplish based on the 
activity.
*/

import React, { useEffect, useState } from "react"
import { Avatar, Grid, Typography, Button, createTheme, ThemeProvider, Box, Dialog, Divider, SvgIcon } from "@mui/material"
import "../App.css"
import { useNavigate, useParams } from "react-router-dom"
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore"
import { auth, db } from "../firebase.config"
import SpinnerComponent from "./SpinnerComponent"
import { uuidv4 } from "@firebase/util"
import GamePreviewComponent from "./GamePreviewComponent"
import { Edit, PersonAddAlt1, PersonRemove } from "@mui/icons-material"
import BadgesComponent from "./BadgesComponent"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function ProfileComponent({ userData, isUser }) {
	const navigate = useNavigate()
	const { username } = useParams()
	const { currentUser } = auth
	const [isFollowing, setIsFollowing] = useState(null)
	const [following, setFollowing] = useState(null)
	const [followers, setFollowers] = useState(null)
	const [numFollowers, setNumFollowers] = useState(null)
	const [numFollowing, setNumFollowing] = useState(null)
	const [numGamesReviewed, setNumGamesReviewed] = useState(null)
	const [numLists, setNumLists] = useState(null)
	const [favoriteGame, setFavoriteGame] = useState(null)

	// useEffect for getting stats
	useEffect(() => {
		// get different forms of user information for badges
		const getStats = async () => {
			const userRef = await doc(db, "users", `${userData.id}`)
			const userSnap = await getDoc(userRef)

			setNumFollowers(userSnap.get("followers").length)
			setNumFollowing(userSnap.get("following").length)

			setNumGamesReviewed(userSnap.get("reviews").length)

			let listCount = userSnap.get("lists").length

			// if they have a tierlist object in their user object, add the count as well
			if (userSnap.get("tierlists")) {
				listCount += userSnap.get("tierlists").length
			}

			setNumLists(listCount)

			let tempFollowerArr = []
			let tempFollowingArr = []

			userSnap.get("followers").forEach(async (follower) => {
				const userInfoDocRef = await doc(db, "users", follower)
				const docSnap3 = await getDoc(userInfoDocRef)
				tempFollowerArr.push({
					profilePic: docSnap3.get("profilePic"),
					username: docSnap3.get("username"),
					name: docSnap3.get("name")
				})
			})

			userSnap.get("following").forEach(async (follower) => {
				const userInfoDocRef = await doc(db, "users", follower)
				const docSnap3 = await getDoc(userInfoDocRef)
				tempFollowingArr.push({
					profilePic: docSnap3.get("profilePic"),
					username: docSnap3.get("username"),
					name: docSnap3.get("name")
				})
			})

			setFollowers(tempFollowerArr)
			setFollowing(tempFollowingArr)
		}

		// retrieves user's favorite game
		const getFavoriteGame = async () => {
			const userRef = await doc(db, "users", `${userData.id}`)
			const userSnap = await getDoc(userRef)
			const favGameData = userSnap.get("favGame")

			const favGameId = favGameData.id
			const favGameName = favGameData.name
			const favGameCover = favGameData.cover
			const favGameRelease = favGameData.year
			setFavoriteGame({
				id: favGameId,
				name: favGameName,
				cover_url: favGameCover,
				release_dates: favGameRelease
			})
		}

		getStats()
		getFavoriteGame()
	}, [userData])

	// button to be displayed if for user's to edit their profile information if they
	// are looking at their own profile or the follow/unfollow button if they
	// are looking at someone else's profile
	function FollowOrEditButton() {
		return (
			<>
				{isUser && (
					<>
						<Button
							sx={{
								flexGrow: 1,
								borderRadius: 2,
								background: "linear-gradient(#313131,#252525)",
								color: "#aaa",
								mt: -1,
								mb: 1,
								boxShadow: "0px 0px 15px #151515",
								"&:hover": { color: "#fff", background: "linear-gradient(#4f319b,#362269)" }
							}}
							onClick={() => navigate("/settings")}>
							<SvgIcon component={Edit} sx={{ width: 25, height: 25, mr: 1 }} />
							<Typography sx={{ mb: -0.25, fontSize: 13, textTransform: "none" }}>Edit</Typography>
						</Button>
					</>
				)}
				{!isUser && (
					<>
						{isFollowing === null ? (
							<SpinnerComponent size={8} override={{ marginRight: 8 }} />
						) : (
							<Button
								sx={{
									flexGrow: 1,
									borderRadius: 2,
									width: 100,
									background: "linear-gradient(#313131,#252525)",
									color: "#aaa",
									mt: -1,
									mb: 1,
									mr: 1,
									boxShadow: "0px 0px 15px #151515",
									"&:hover": { color: "#fff", background: "linear-gradient(#4f319b,#362269)" }
								}}
								onClick={() => manageFollow()}>
								{isFollowing ? (
									<>
										<SvgIcon component={PersonRemove} sx={{ width: 25, height: 25, mr: 1 }} />
										<Typography sx={{ mb: -0.25, fontSize: 13, textTransform: "none" }}>Unfollow</Typography>
									</>
								) : (
									<>
										<SvgIcon component={PersonAddAlt1} sx={{ width: 25, height: 25, mr: 1 }} />
										<Typography sx={{ mb: -0.25, fontSize: 13, textTransform: "none" }}>Follow</Typography>
									</>
								)}
							</Button>
						)}
					</>
				)}
			</>
		)
	}

	// useEffect for determining following status
	useEffect(() => {
		const setFollowSelection = async () => {
			const userRef = await doc(db, "users", currentUser.uid)
			const userSnap = await getDoc(userRef)
			const followingArr = userSnap.get("following")
			let requestedUserId = null
			const q = query(collection(db, "users"), where("username", "==", username))
			const querySnap = await getDocs(q)
			querySnap.forEach((doc) => {
				requestedUserId = doc.id
			})

			if (followingArr.includes(requestedUserId)) {
				setIsFollowing(true)
			} else setIsFollowing(false)
		}
		if (!isUser) setFollowSelection()
	}, [username, isFollowing])

	// states and functions for Followers Dialog
	const [openFollowers, setOpenFollowers] = useState(false)

	// open the dialog with the list of the users who follow the profile page user
	const handleOpenFollowers = () => {
		setOpenFollowers(true)
	}
	// close the dialog with the list of the users who follow the profile page user
	const handleCloseFollowers = () => {
		setOpenFollowers(false)
	}

	// states and functions for Following Dialog
	const [openFollowing, setOpenFollowing] = useState(false)

	// open the dialog with the list of the users the profile page user follows
	const handleOpenFollowing = () => {
		setOpenFollowing(true)
	}
	// close the dialog with the list of the users the profile page user follows
	const handleCloseFollowing = () => {
		setOpenFollowing(false)
	}

	// modal that shows a list of the users the profile page user follows
	function ShowFollowersModal() {
		return (
			<Box
				borderRadius={2}
				sx={{
					top: "40%",
					left: "50%",
					width: 400,
					height: "auto",
					minHeight: 300,
					maxHeight: 500,
					border: "2px solid #000"
				}}>
				<Grid container sx={{ backgroundColor: "#494949" }} borderRadius={3}>
					<ThemeProvider theme={theme}>
						<Typography align={"center"} color="#fff" variant="h5" sx={{ flexGrow: 1, mt: 2, mb: 2 }}>
							Followers
						</Typography>
					</ThemeProvider>
					{followers.map((f, i) => (
						<Grid container sx={{ mt: 1, mb: 1 }} key={i}>
							<Grid item xs={12}>
								<Divider />
							</Grid>
							<Grid item xs={2}>
								<Avatar
									alt="username"
									src={f.profilePic}
									sx={{
										width: 50,
										height: 50,
										"&:hover": {
											border: 0,
											borderColor: "#4C2F97",
											cursor: "pointer"
										},
										ml: 2,
										mt: 1
									}}
									onClick={() => {
										setOpenFollowers(false)
										setOpenFollowing(false)
										navigate(`/${f.username}`)
									}}
								/>
							</Grid>
							<Grid item xs={10}>
								<Typography
									sx={{
										mt: 2.5,
										mx: 2,
										"&:hover": { textDecoration: "underline", cursor: "pointer" }
									}}
									color="#fff"
									onClick={() => {
										setOpenFollowers(false)
										setOpenFollowing(false)
										navigate(`/${f.username}`)
									}}>
									{f.username}
								</Typography>
							</Grid>
						</Grid>
					))}
				</Grid>
			</Box>
		)
	}

	// modal that shows a list of the users who follow the profile page
	function ShowFollowingModal() {
		return (
			<Box
				borderRadius={2}
				sx={{
					top: "40%",
					left: "50%",
					width: 400,
					height: "auto",
					minHeight: 300,
					maxHeight: 500,
					border: "2px solid #000"
				}}>
				<Grid container sx={{ backgroundColor: "#494949" }} borderRadius={2}>
					<ThemeProvider theme={theme}>
						<Typography align={"center"} variant="h5" color="#fff" sx={{ flexGrow: 1, mt: 2, mb: 2 }}>
							Following
						</Typography>
					</ThemeProvider>
					{following.map((f, i) => (
						<Grid container sx={{ mt: 1, mb: 1 }} key={i}>
							<Grid item xs={12}>
								<Divider />
							</Grid>
							<Grid item xs={2}>
								<Avatar
									alt="username"
									src={f.profilePic}
									sx={{
										width: 50,
										height: 50,
										"&:hover": {
											border: 0,
											borderColor: "#4C2F97",
											cursor: "pointer"
										},
										ml: 2,
										mt: 1
									}}
									onClick={() => {
										setOpenFollowers(false)
										setOpenFollowing(false)
										navigate(`/${f.username}`)
									}}
								/>
							</Grid>
							<Grid item xs={8}>
								<Typography
									color="#fff"
									sx={{
										mt: 2.5,
										mx: 2,
										"&:hover": { textDecoration: "underline", cursor: "pointer" }
									}}
									onClick={() => {
										setOpenFollowers(false)
										setOpenFollowing(false)
										navigate(`/${f.username}`)
									}}>
									{f.username}
								</Typography>
							</Grid>
						</Grid>
					))}
				</Grid>
			</Box>
		)
	}

	// handles following the profile page user
	const manageFollow = async () => {
		const userActionRef = await doc(db, "users", currentUser.uid)
		const userActionSnap = await getDoc(userActionRef)
		let requestedUserId = null
		const q = query(collection(db, "users"), where("username", "==", username))
		const querySnap = await getDocs(q)
		querySnap.forEach((doc) => {
			requestedUserId = doc.id
		})
		const requestedUserRef = await doc(db, "users", requestedUserId)

		// action user already follows requested user
		if (userActionSnap.data().following.includes(requestedUserId)) {
			await updateDoc(userActionRef, {
				following: arrayRemove(requestedUserId)
			})
			await updateDoc(requestedUserRef, {
				followers: arrayRemove(currentUser.uid)
			})
		} else {
			// action user does not already follow requested user
			await updateDoc(userActionRef, {
				following: arrayUnion(requestedUserId)
			})
			// notify user that they just got followed
			await updateDoc(requestedUserRef, {
				followers: arrayUnion(currentUser.uid),
				notifications: arrayUnion({
					id: uuidv4(),
					createdAt: Timestamp.now(),
					senderId: currentUser.uid,
					senderProfilePic: userActionSnap.get("profilePic"),
					text: `@${userActionSnap.get("username")} started following you!`,
					data: { username: userActionSnap.get("username") },
					seen: false,
					scenario: 4
				})
			})
		}
		setIsFollowing(null)
	}

	return (
		<>
			<Grid className="box" borderRadius={2} container rowSpacing={2} sx={{ width: "auto", maxWidth: 915 }}>
				<Grid item md={8} xs={12}>
					<Grid container>
						<Grid item md={3} align={"left"} sx={{ mt: 1, ml: 2, mr: 1 }}>
							<Avatar alt="username" src={userData.pfp} sx={{ width: { xs: 75, md: 120 }, height: { xs: 75, md: 120 }, mb: 2 }} />
						</Grid>
						<Grid item md={8} xs={7} align={"left"} sx={{ ml: 0, mt: 1 }}>
							{/* profile name */}
							<Grid container>
								<Grid item md={9} xs={7}>
									<ThemeProvider theme={theme}>
										<Typography variant="h5" sx={{ flexGrow: 1, fontSize: { xs: 17, md: 24 } }}>
											{userData.name}
										</Typography>
									</ThemeProvider>
								</Grid>
								<Grid item md={2} xs={1}>
									<FollowOrEditButton></FollowOrEditButton>
								</Grid>
							</Grid>

							{/* username */}
							<Typography variant="h5" fontSize={"15px"} sx={{ flexGrow: 1 }}>
								@{userData.username}
							</Typography>

							{/* bio */}
							<Typography fontSize={14} sx={{ flexGrow: 1, mr: 1, mb: 2, mt: 2 }}>
								{userData.bio}
							</Typography>
						</Grid>

						<Grid item md={12}>
							<Grid container align={"center"} sx={{ mt: 2 }}>
								{/* Followers, Following, All Games Reviewed, Lists */}
								<Grid item md={3} xs={6} align={"center"}>
									<Button onClick={handleOpenFollowers} sx={{ maxWidth: 100, color: "#fff" }}>
										<Typography
											fontSize={13}
											sx={{
												"&:hover": { textDecoration: "underline", cursor: "pointer" }
											}}>
											{" "}
											{numFollowers} <br /> Followers
										</Typography>
									</Button>
								</Grid>
								<Grid item md={3} xs={6} align={"center"}>
									<Button onClick={handleOpenFollowing} sx={{ maxWidth: 100, color: "#fff" }}>
										<Typography
											fontSize={13}
											sx={{
												"&:hover": { textDecoration: "underline", cursor: "pointer" }
											}}>
											{" "}
											{numFollowing} <br /> Following
										</Typography>
									</Button>
								</Grid>
								<Grid item md={3} xs={6} align={"center"}>
									<Button onClick={() => navigate(`/${userData.username}/gamesreviewed`)} sx={{ maxWidth: 100, color: "#fff" }}>
										<Typography
											fontSize={13}
											sx={{
												"&:hover": { textDecoration: "underline", cursor: "pointer" }
											}}>
											{" "}
											{numGamesReviewed} <br /> Games Reviewed
										</Typography>
									</Button>
								</Grid>
								<Grid item md={3} xs={6} align={"center"}>
									<Button onClick={() => navigate(`/${userData.username}/lists`)} sx={{ maxWidth: 100, color: "#fff" }}>
										<Typography
											fontSize={13}
											sx={{
												"&:hover": { textDecoration: "underline", cursor: "pointer" }
											}}>
											{" "}
											{numLists} <br /> Lists
										</Typography>
									</Button>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Grid>

				<Grid item md={3}>
					<Grid container align={"center"} sx={{}}>
						<Grid item xs={12} align={"left"} sx={{ mb: 2 }}>
							<ThemeProvider theme={theme}>
								<Typography fontSize={20} variant="h5" sx={{ flexGrow: 1, ml: 1 }}>
									Favorite Game
								</Typography>
							</ThemeProvider>
						</Grid>
						<Grid item xs={12} align={"center"} sx={{ mt: 1 }}>
							{favoriteGame !== null && <GamePreviewComponent maxW={290} gameData={favoriteGame} />}
						</Grid>
					</Grid>
				</Grid>

				<Grid item xs={12}>
					{" "}
					<Divider sx={{ backgroundColor: "#494949" }} />
				</Grid>

				<Grid item xs={12} sx={{ height: { xs: 350, md: 150 }, mt: { xs: -8, md: -4 }, algin: { xs: "center", md: "left" } }}>
					<BadgesComponent userData={userData} isUser={isUser} />
				</Grid>

				<Dialog
					open={openFollowers}
					onClose={handleCloseFollowers}
					scroll="body"
					PaperProps={{
						style: {
							mx: 3,
							backgroundColor: "transparent"
						}
					}}>
					<ShowFollowersModal />
				</Dialog>
				<Dialog
					maxWidth={"50"}
					open={openFollowing}
					onClose={handleCloseFollowing}
					scroll="body"
					PaperProps={{
						style: {
							mx: 3,
							backgroundColor: "transparent"
						}
					}}>
					<ShowFollowingModal />
				</Dialog>
			</Grid>
		</>
	)
}

export default ProfileComponent
