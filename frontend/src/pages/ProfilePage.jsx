/*
The ProfilePage. This page displays all of the relevant information related to a specific user

This page contains:
The user's profile picture, profile name, username
Stats like amount of followers and following, reviews, and lists
a follow button
their favorite game
their badges
their backlog
their recent activity
*/

import React, { useEffect } from "react"
import BacklogPreviewComponent from "../components/BacklogPreviewComponent"
import Footer from "../components/FooterComponent"
import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import { Grid } from "@mui/material"
import RecentActivityComponent from "../components/RecentActivityComponent"
import ProfileComponent from "../components/ProfileComponent"
import { useState } from "react"
import Spinner from "../components/Spinner"
import { auth, db } from "../firebase.config"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { useNavigate, useParams } from "react-router-dom"
import { checkGameCache } from "../helperFunctions/checkGameCache"

function ProfilePage() {
	const [backlogGames, setBacklogGames] = useState(null)
	const [backlogGamesIds, setBacklogGamesIds] = useState(null)

	const [activity, setActivity] = useState(null)
	const [activityToShow, setActivityToShow] = useState(null)

	const [userData, setUserData] = useState(null)
	const [isUser, setIsUser] = useState(false)

	const { currentUser } = auth
	const userID = currentUser.uid

	const { username } = useParams()
	const navigate = useNavigate()

	let userIDPage = ""

	// use effect for getting data related to this user
	useEffect(() => {
		getUserData()
	}, [userID, username])


	// use effect for getting this user's backlog
	useEffect(() => {
		let subscribed = true
		const fetchGameData = async () => {
			setBacklogGames(null)
			let fetchedData = null
			if (backlogGamesIds.length) {
				fetchedData = await checkGameCache(backlogGamesIds)
			} else fetchedData = []

			if (subscribed) {
				setBacklogGames(fetchedData)
			}
		}

		if (backlogGamesIds) fetchGameData()
		return () => {
			subscribed = false
		}
	}, [backlogGamesIds, username])

	// gets user
	async function getUserData() {
		setBacklogGamesIds(null)
		setActivityToShow(null) // set to null to show loading in the RecentActivityComponent

		const usersRef = collection(db, "users")
		const q = query(usersRef, where("username", "==", username))
		const userSnapshot = await getDocs(q)

		if (userSnapshot.empty) navigate("/notfound")

		userSnapshot.forEach((user) => {
			setBacklogGamesIds(user.data().backlog)
			setUserData({
				pfp: user.data().profilePic,
				username: user.data().username,
				name: user.data().name,
				bio: user.data().bio,
				id: user.id
			})
			setIsUser(user.id === userID)
			userIDPage = user.id
		})

		// get 3 most recent reviews and append them to a list
		let tempArr = []

		const reviewsRef = collection(db, "reviews")
		const tierListsRef = collection(db, "tierlists")
		const listsRef = collection(db, "lists")

		const q_reviews = await query(reviewsRef, where("userId", "==", userIDPage), orderBy("createdAt", "desc"))
		const reviewsSnap = await getDocs(q_reviews)
		const q_tierlists = await query(tierListsRef, where("userId", "==", userIDPage), orderBy("createdAt", "desc"))
		const tierlistsSnap = await getDocs(q_tierlists)
		const q_lists = await query(listsRef, where("userId", "==", userIDPage), orderBy("createdAt", "desc"))
		const listsSnap = await getDocs(q_lists)

		// add all activity to a list, sorted by time created
		if (!reviewsSnap.empty) {
			reviewsSnap.forEach((review) => {
				tempArr.push({
					type: "review",
					id: review.id,
					createdAt: review.data().createdAt,
					review: review.data().review,
					rating: review.data().rating,
					platform: review.data().platform,
					hoursPlayed: review.data().hoursPlayed,
					timesCompleted: review.data().timesCompleted,
					positiveAttributes: review.data().positiveAttributes,
					negativeAttributes: review.data().negativeAttributes,
					upvotes: review.data().upvotes,
					downvotes: review.data().downvotes,
					gameCover: review.data().gameCover,
					gameTitle: review.data().gameTitle,
					gameReleaseDate: review.data().gameReleaseDate,
					containsSpoiler: review.data().containsSpoiler,
					comments: review.data().comments,
					userId: review.data().userId,
					gameId: review.data().gameId
				})
			})
		}

		if (!tierlistsSnap.empty) {
			tierlistsSnap.forEach((tierlist) => {
				tempArr.push({
					type: "tierlist",
					listObj: tierlist.data().list,
					createdAt: tierlist.data().createdAt,
					id: tierlist.id,
					upvotes: tierlist.data().upvotes,
					downvotes: tierlist.data().downvotes,
					title: tierlist.data().name,
					description: tierlist.data().listDescription,
					userId: tierlist.data().userId,
					comments: tierlist.data().comments,
					username: username,
					name: "@" + username
				})
			})
		}

		if (!listsSnap.empty) {
			listsSnap.forEach((list) => {
				tempArr.push({
					type: "list",
					listObj: list.data().list,
					createdAt: list.data().createdAt,
					id: list.id,
					upvotes: list.data().upvotes,
					downvotes: list.data().downvotes,
					title: list.data().name,
					description: list.data().listDescription,
					userId: list.data().userId,
					comments: list.data().comments,
					username: username,
					name: "@" + username
				})
			})
		}

		if (tempArr.length !== 0) {
			tempArr.sort((a, b) => b.createdAt - a.createdAt)
			setActivityToShow(true)
		} else setActivityToShow(false)

		setActivity(tempArr)
	}

	if (!backlogGames || !userData) return <Spinner />
	return (
		<>
			<Navbar />
			<SideNav />
			<Grid container rowSpacing={1} sx={{ mx: 3, width: "auto", mt: 3, mb: 3 }}>
				<Grid item xs={12} align={"center"}>
					<ProfileComponent userData={userData} isUser={isUser}></ProfileComponent>
				</Grid>
				<Grid item xs={12} align={"center"} sx={{ mt: 2 }}>
					<BacklogPreviewComponent gameData={backlogGames} username={username} isUser={isUser}></BacklogPreviewComponent>
				</Grid>
				{activityToShow !== null && (
					<Grid item xs={12} align={"center"} sx={{ mt: 2 }}>
						<RecentActivityComponent
							parentPage={{ page: "ProfilePage" }}
							isUser={isUser}
							username={username}
							activity={activity}
							activityToShow={activityToShow}
							reloadReviews={getUserData}
						/>
					</Grid>
				)}
			</Grid>
			<Footer />
		</>
	)
}

export default ProfilePage
