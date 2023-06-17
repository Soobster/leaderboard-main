/*
The HomePage. The central location for Leaderboard. This page has various components listed below.

Trending
This shows the games that have received the highest average ratings this week. Only the first 3
are shown as a preview. Clicking "See More" will redirect you to its specific page with all 10.

Recommended For You
This shows games that you might enjoy based on other games you've rated highly. Only the first 3
are shown as a preview. Clicking "See More" will redirect you to its specific page with all games recommended
for you.

Recent Activity From People You Follow
This shows the 5 most recent activity from the people you follow. This will include star reviews, 
written reviews, tierlist creation, and list creation. Only the first 5 are shown as a preview. Clicking 
on "See More" will redirect you to to its specific page where each person you follow's activity is shown.
Each person will only have their 3 most recent pieces of activity shown though.
*/

import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import { useNavigate } from "react-router-dom"
import { UserAuth } from "../context/AuthContext"
import { useEffect } from "react"
import TrendingComponent from "../components/TrendingComponent"
import RecommendedComponent from "../components/RecommendedComponent"
import Spinner from "../components/Spinner"
import Footer from "../components/FooterComponent"
import { Button, createTheme, Grid, Typography } from "@mui/material"
import { useState } from "react"
import { doc, getDoc, getDocs, query, where, orderBy, collection, limit } from "firebase/firestore"
import { db } from "../firebase.config"
import RecentActivityComponent from "../components/RecentActivityComponent"
import { checkGameCache } from "../helperFunctions/checkGameCache"

// Header font
const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function HomePage() {
	const navigate = useNavigate()

	const { currentUser } = UserAuth()

	let userID
	if (currentUser) {
		userID = currentUser.uid
	}

	const [highestRatedGames, setHighestRatedGames] = useState(null)
	const [highestRatedIds, setHighestRatedIds] = useState(null)
	const [recommendedGames, setRecommendedGames] = useState(null)
	const [recommendedIds, setRecommendedIds] = useState(null)

	// states for Recent Activity From People You Follow component
	const [activity, setActivity] = useState([])
	const [activityToShow, setActivityToShow] = useState(true)

	// useEffect for getting the highestRated and recommeneded collections
	useEffect(() => {
		const getHighestRatedIds = async () => {
			// query based method
			const ref = doc(db, "highestRated", "games")
			const snap = await getDoc(ref)
			setHighestRatedIds(snap.data().top10.slice(0, 3))
		}
		const getRecommendedIds = async () => {
			// query based method
			const ref = doc(db, "users", `${userID}`)
			const snap = await getDoc(ref)
			setRecommendedIds(snap.data().topRecommended.slice(0, 3))
		}
		getHighestRatedIds()
		getRecommendedIds()
	}, [])

	// use effect for grabbing the games to display
	useEffect(() => {
		if (!currentUser) navigate("/auth")

		let subscribed = true
		const fetchGameData = async () => {
			const allIds = highestRatedIds.concat(recommendedIds)
			const fetchedData = await checkGameCache(allIds)
			if (subscribed) {
				const highestRatedGames = fetchedData.filter((game) => highestRatedIds.includes(`${game.id}`))
				let correctFetchedData = new Array(highestRatedIds.length)
				highestRatedGames.forEach((game) => (correctFetchedData[highestRatedIds.indexOf(`${game.id}`)] = game))
				setHighestRatedGames(correctFetchedData)

				const recommendedGames = fetchedData.filter((game) => recommendedIds.includes(`${game.id}`))
				let correctFetchedData2 = new Array(recommendedIds.length)
				recommendedGames.forEach((game) => (correctFetchedData2[recommendedIds.indexOf(`${game.id}`)] = game))
				setRecommendedGames(correctFetchedData2)
			}
		}
		if (highestRatedIds && recommendedIds) fetchGameData()

		return () => {
			subscribed = false
		}
	}, [highestRatedIds, recommendedIds])

	// use effect for getting Recent Activity From People You Follow
	useEffect(() => {
		if (currentUser) {
			getUserData()
		}
	}, [])

	// gets Recent Activity From People You Follow
	async function getUserData() {
		const userRef = await doc(db, "users", currentUser.uid)
		const userSnap = await getDoc(userRef)
		const followingArr = await userSnap.get("following")

		if (followingArr.length === 0) {
			setActivityToShow(false)
			setActivity([])
			return
		}

		let activityArr = []

		// fetch and merge to activityArr all activities from user
		async function fetchAndMergeActivities(refName, followingChunk) {
			const ref = collection(db, refName)
			const q = await query(ref, where("userId", "in", followingChunk), orderBy("createdAt", "desc"))
			const snap = await getDocs(q)

			if (!snap.empty) {
				await Promise.all(
					snap.docs.map(async (document) => {
						const data = document.data()
						const userInfoDocRef = await doc(db, "users", data.userId)
						const userInfoDocSnap = await getDoc(userInfoDocRef)
						if (document.data().userId === userInfoDocSnap.id) {
							activityArr.push({
								type: `${refName.slice(0, -1)}`,
								[`${refName.slice(0, -1)}`]: document,
								createdAt: data.createdAt,
								profilePic: userInfoDocSnap.get("profilePic"),
								username: userInfoDocSnap.get("username"),
								name: userInfoDocSnap.get("name")
							})
						}
					})
				)
			}
		}

		// split followingArr into chunks of 10
		function chunkArray(arr, size) {
			return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))
		}

		const chunkedFollowingArr = chunkArray(followingArr, 10)

		for (const chunk of chunkedFollowingArr) {
			await Promise.all([fetchAndMergeActivities("reviews", chunk), fetchAndMergeActivities("tierlists", chunk), fetchAndMergeActivities("lists", chunk)])
		}

		if (activityArr.length !== 0) {
			// sort by most recent
			activityArr.sort((a, b) => b.createdAt - a.createdAt)

			let tempArr = []
			for (let i = 0; i < activityArr.length; i++) {
				if (activityArr[i].type === "review") {
					tempArr.push({
						type: "review",
						id: activityArr[i].review.id,
						review: activityArr[i].review.data().review,
						rating: activityArr[i].review.data().rating,
						platform: activityArr[i].review.data().platform,
						hoursPlayed: activityArr[i].review.data().hoursPlayed,
						timesCompleted: activityArr[i].review.data().timesCompleted,
						positiveAttributes: activityArr[i].review.data().positiveAttributes,
						negativeAttributes: activityArr[i].review.data().negativeAttributes,
						upvotes: activityArr[i].review.data().upvotes,
						downvotes: activityArr[i].review.data().downvotes,
						gameCover: activityArr[i].review.data().gameCover,
						gameTitle: activityArr[i].review.data().gameTitle,
						gameReleaseDate: activityArr[i].review.data().gameReleaseDate,
						containsSpoiler: activityArr[i].review.data().containsSpoiler,
						userId: activityArr[i].review.data().userId,
						gameId: activityArr[i].review.data().gameId,
						profilePic: activityArr[i].profilePic,
						username: activityArr[i].username,
						name: activityArr[i].name,
						comments: activityArr[i].review.data().comments,
						createdAt: activityArr[i].review.data().createdAt
					})
				} else if (activityArr[i].type === "tierlist") {
					tempArr.push({
						type: "tierlist",
						listObj: activityArr[i].tierlist.data().list,
						id: activityArr[i].tierlist.id,
						upvotes: activityArr[i].tierlist.data().upvotes,
						downvotes: activityArr[i].tierlist.data().downvotes,
						title: activityArr[i].tierlist.data().name,
						description: activityArr[i].tierlist.data().listDescription,
						userId: activityArr[i].tierlist.data().userId,
						profilePic: activityArr[i].profilePic,
						username: activityArr[i].username,
						name: activityArr[i].name,
						comments: activityArr[i].tierlist.data().comments,
						createdAt: activityArr[i].tierlist.data().createdAt
					})
				} else {
					tempArr.push({
						type: "list",
						listObj: activityArr[i].list.data().list,
						id: activityArr[i].list.id,
						upvotes: activityArr[i].list.data().upvotes,
						downvotes: activityArr[i].list.data().downvotes,
						title: activityArr[i].list.data().name,
						description: activityArr[i].list.data().listDescription,
						userId: activityArr[i].list.data().userId,
						profilePic: activityArr[i].profilePic,
						username: activityArr[i].username,
						name: activityArr[i].name,
						comments: activityArr[i].list.data().comments,
						createdAt: activityArr[i].list.data().createdAt
					})
				}
			}

			setActivity(tempArr)
		} else setActivityToShow(false)
	}

	if (highestRatedGames && recommendedGames) {
		return (
			highestRatedGames &&
			recommendedGames && (
				<>
					<div className="content-wrapper">
						<Navbar />
						<SideNav />

						<Grid container rowSpacing={1} sx={{ mx: 3, width: "auto", mt: 3, mb: 3 }}>
							<Grid item xs={12} align={"center"}>
								<TrendingComponent gameData={highestRatedGames}></TrendingComponent>
							</Grid>
							<Grid item xs={12} align={"center"} sx={{ mt: 2 }}>
								<RecommendedComponent gameData={recommendedGames}></RecommendedComponent>
							</Grid>
							<Grid item xs={12} align={"center"} sx={{ mt: 2 }}>
								<Grid className="box" borderRadius={2} container rowSpacing={2} sx={{ width: "auto", maxWidth: 915 }}>
									<Grid item xs={12} align={"center"}>
										<RecentActivityComponent parentPage={{ page: "HomePage" }} activity={activity} activityToShow={activityToShow} />
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</div>
					<Footer />
				</>
			)
		)
	}
	return <Spinner />
}
export default HomePage
