/*
The BacklogComponent. This displays content that will be displayed on the "BacklogPage.jsx" file.

Games a user has saved in their backlog will appear in a vertical ordered list. The user is able
to change the ordering by clicking and dragging from the 3 bars located on the left side of each
game card. Other users do not have this functionality and can only view the backlog.

The 3 games at the top of the list will be displayed on the backlog preview in the profile page.

*/

import { Grid, createTheme, ThemeProvider, Typography, SvgIcon } from "@mui/material"
import GamePreviewComponent from "../components/GamePreviewComponent"
import "../App.css"
import { SentimentVeryDissatisfied } from "@mui/icons-material"
import { useEffect, useRef, useState } from "react"
import { auth, db } from "../firebase.config"
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore"
import SpinnerComponent from "./SpinnerComponent"
import { useNavigate, useParams } from "react-router-dom"
import { checkGameCache } from "../helperFunctions/checkGameCache"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function BacklogComponent() {
	const [backlogGames, setBacklogGames] = useState(null)
	const [backlogGamesIds, setBacklogGamesIds] = useState(null)
	const [isUser, setIsUser] = useState(null)
	const { currentUser } = auth
	const userID = currentUser.uid
	let { username } = useParams()
	const navigate = useNavigate()

	async function getBacklog() {
		const usersRef = collection(db, "users")
		const q = query(usersRef, where("username", "==", username))
		const userSnapshot = await getDocs(q)
		if (userSnapshot.empty) navigate("/notfound")
		userSnapshot.forEach((user) => {
			setBacklogGamesIds(user.data().backlog)
			setIsUser(user.id === userID)
			setBacklogGames(null)
		})
	}

	async function saveBacklog(ids) {
		const userRef = doc(db, "users", userID)
		const docSnap = await getDoc(userRef)
		await updateDoc(userRef, {
			backlog: ids
		})
	}

	if (!backlogGamesIds) {
		getBacklog()
	} else if (!backlogGamesIds.length) {
		setBacklogGamesIds([0])
	}

	useEffect(() => {
		let subscribed = true
		const fetchGameData = async () => {
			const fetchedData = await checkGameCache(backlogGamesIds)
			if (subscribed) {
				let correctFetchedData = new Array(backlogGamesIds.length)
				fetchedData.forEach((game) => (correctFetchedData[backlogGamesIds.indexOf(game.id)] = game))
				setBacklogGames(correctFetchedData)
			}
		}
		if (backlogGamesIds) fetchGameData()
		return () => {
			subscribed = false
		}
	}, [backlogGamesIds])

	const dragItem = useRef(null)
	const dragOverItem = useRef(null)

	//const handle drag sorting
	const handleBacklogSort = async () => {
		//duplicate items
		let _backlogItems = [...backlogGames]
		//remove and save the dragged item content
		const draggedItemContent = _backlogItems.splice(dragItem.current, 1)[0]
		//switch the position
		_backlogItems.splice(dragOverItem.current, 0, draggedItemContent)
		//reset the position ref
		dragItem.current = null
		dragOverItem.current = null
		//update the actual array
		setBacklogGames(null)
		updateBacklogList(_backlogItems)
	}

	const updateBacklogList = (newOrdering) => {
		setTimeout(() => {
			setBacklogGames(newOrdering)
		}, 0)
		const newOrderingIds = newOrdering.map((game) => game.id)
		saveBacklog(newOrderingIds)
	}

	return (
		<>
			<Grid
				className="box"
				borderRadius={3}
				container
				rowSpacing={1}
				columnSpacing={2}
				align={"center"}
				sx={{ mx: 3, width: "auto", mt: 3, mb: 3, maxWidth: 915 }}>
				<Grid item xs={12} align={"center"} sx={{ mx: 5, mt: 1, mb: 1, width: "auto" }}>
					<ThemeProvider theme={theme}>
						<Typography variant="h5" sx={{ flexGrow: 1 }}>
							Backlog
						</Typography>
						{!backlogGames && <SpinnerComponent override={{ position: "relative", margin: "50px" }} />}
					</ThemeProvider>
				</Grid>
				{backlogGames &&
					backlogGamesIds[0] != 0 &&
					isUser !== null &&
					backlogGames.map((game, i) => (
						<div
							key={i}
							draggable={isUser}
							onDragStart={(e) => (dragItem.current = i)}
							onDragEnter={(e) => (dragOverItem.current = i)}
							onDragEnd={handleBacklogSort}
							onDragOver={(e) => e.preventDefault()}>
							<Grid item xs={10} sx={{ mt: 2, mb: 2, ml: { xs: 4, sm: 16, md: 19 } }}>
								<GamePreviewComponent
									gameData={{
										id: game.id,
										name: game.name,
										cover_url: game.cover.url,
										rating: game.rating,
										release_dates: game.release_dates
									}}
									getBacklog={getBacklog}
									isUser={isUser}
								/>
							</Grid>
						</div>
					))}
				{backlogGames && backlogGamesIds[0] == 0 && (
					<>
						<Grid item xs={12} align={"center"} sx={{ mx: 5, mt: 1, mb: 1, width: "auto" }}>
							{isUser ? (
								<>
									<SvgIcon component={SentimentVeryDissatisfied} inheritViewBox sx={{ width: 50, height: 75, mt: 2 }} />
									<Typography variant="h6" sx={{ flexGrow: 1, mt: 1, mb: 4 }}>
										Your backlog is empty! Games you add to your backlog will show up here
									</Typography>
								</>
							) : (
								<>
									<SvgIcon component={SentimentVeryDissatisfied} inheritViewBox sx={{ width: 50, height: 75, mt: 2 }} />
									<Typography variant="h6" sx={{ flexGrow: 1, mt: 1, mb: 4 }}>
										{username}'s backlog is empty!
									</Typography>
								</>
							)}
						</Grid>
					</>
				)}
			</Grid>
		</>
	)
}

export default BacklogComponent
