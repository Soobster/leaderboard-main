
/*
The User Search Results component. To be displayed in the search page under the users tab.

Displays information about users returned by the search including: 
-profile picture
-username
-account name-bio
-follow/unfollow button

*/
import React, { useEffect } from "react"
import { Avatar, Grid, Typography, Button, createTheme, ThemeProvider, SvgIcon } from "@mui/material"
import "../App.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { auth, db } from "../firebase.config"
import SpinnerComponent from "./SpinnerComponent"
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore"
import { uuidv4 } from "@firebase/util"
import { Edit, PersonAddAlt1, PersonRemove } from "@mui/icons-material"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function UserSearchResultComponent({ userData }) {
	const navigate = useNavigate()
	const { currentUser } = auth
	const [following, setFollowing] = useState(null)
	const [isUser, setIsUser] = useState(userData.id === currentUser.uid)

	//check if the user is already being followed
	useEffect(() => {
		const setFollowSelection = async () => {
			const userRef = await doc(db, "users", currentUser.uid)
			const userSnap = await getDoc(userRef)
			const followingArr = userSnap.get("following")
			let requestedUserId = null
			const q = query(collection(db, "users"), where("username", "==", userData.username))
			const querySnap = await getDocs(q)
			querySnap.forEach((doc) => {
				requestedUserId = doc.id
			})

			if (followingArr.includes(requestedUserId)) {
				setFollowing(true)
			} else setFollowing(false)
		}
		if (!isUser) setFollowSelection()
	}, [following])

	// handle when the follow/unfollow button is clicked
	const manageFollow = async () => {
		const userActionRef = await doc(db, "users", currentUser.uid)
		const userActionSnap = await getDoc(userActionRef)
		let requestedUserId = null
		const q = query(collection(db, "users"), where("username", "==", userData.username))
		const querySnap = await getDocs(q)
		querySnap.forEach((doc) => {
			requestedUserId = doc.id
		})
		const requestedUserRef = await doc(db, "users", requestedUserId)

		// action user already follows requested user
		if (userActionSnap.data().following.includes(requestedUserId)) {
			await updateDoc(userActionRef, {
				"following": arrayRemove(requestedUserId)
			})
			await updateDoc(requestedUserRef, {
				"followers": arrayRemove(currentUser.uid)
			})
		} else {
			// action user does not already follow requested user
			await updateDoc(userActionRef, {
				"following": arrayUnion(requestedUserId)
			})
			await updateDoc(requestedUserRef, {
				"followers": arrayUnion(currentUser.uid)
			})
			// notify user that they just got followed
			await updateDoc(requestedUserRef, {
				"followers": arrayUnion(currentUser.uid),
				"notifications": arrayUnion({
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
		setFollowing(null)
	}

	return (
		<>
			<Grid borderRadius={2} container rowSpacing={2} sx={{ mt: { xs: 1, md: 3 }, width: "auto", ml: { xs: -2, md: -1 }, maxWidth: 400, maxHeight: 200, boxShadow: '0px 0px 15px #0f0f0f', background: 'linear-gradient(#2e2e2e, transparent)' }}>
				<Grid item xs={3} align={"left"} sx={{ mt: 1, ml: { xs: 1, md: 3 } }}>
					<Avatar
						alt="username"
						src={userData.profilePic}
						sx={{ width: 75, height: 75, "&:hover": { cursor: "pointer", boxShadow: "0px 0px 13px #4C2F97" } }}
						onClick={() => {
							navigate(`/${userData.username}`)
						}}
					/>
				</Grid>
				<Grid item xs={7} align={"left"} sx={{ mt: 1, ml: { xs: 2, md: 1 } }}>
					<ThemeProvider theme={theme}>
						<Typography
							variant="h5"
							sx={{ flexGrow: 1, "&:hover": { textDecoration: "underline", cursor: "pointer" } }}
							onClick={() => {
								navigate(`/${userData.username}`)
							}}>
							{userData.name}
						</Typography>
					</ThemeProvider>

					<Typography
						fontSize={"14px"}
						variant="h5"
						sx={{ flexGrow: 1, "&:hover": { textDecoration: "underline", cursor: "pointer" } }}
						onClick={() => {
							navigate(`/${userData.username}`)
						}}>
						@{userData.username}
					</Typography>
					<Typography sx={{
						mt: 1, flexGrow: 1, overflow: "hidden",
						textOverflow: "ellipsis",
						display: "-webkit-box",
						WebkitLineClamp: "2",
						WebkitBoxOrient: "vertical",
						flexGrow: 1,
						height: 48,
						textDecoration: "none",
						"&:hover": { textDecoration: "underline" }
					}}>
						{userData.bio}
					</Typography>
				</Grid>
				{!isUser && (
					<Grid item xs={12} align={"right"}>
						{following === null ? (
							<SpinnerComponent size={8} override={{ marginRight: 8 }} />
						) : (
							<Button
								sx={{
									flexGrow: 1, borderRadius: 2, width: 100, background: "linear-gradient(#313131,#252525)", color: "#aaa", mt: -1, mb: 1, mr: 1, boxShadow: '0px 0px 15px #151515',
									"&:hover": { color: "#fff", background: "linear-gradient(#4f319b,#362269)" }
								}} onClick={() => manageFollow()}>
								{following ?
									<>
										<SvgIcon component={PersonRemove} sx={{ width: 25, height: 25, mr: 1 }} />
										<Typography sx={{ mb: -.25, fontSize: 13, textTransform: 'none' }}>
											Unfollow
										</Typography>
									</>
									:
									<><SvgIcon component={PersonAddAlt1} sx={{ width: 25, height: 25, mr: 1 }} />
										<Typography sx={{ mb: -.25, fontSize: 13, textTransform: 'none' }}>
											Follow
										</Typography></>
								}
							</Button>
						)}
					</Grid>
				)}
			</Grid>
		</>
	)
}

export default UserSearchResultComponent
