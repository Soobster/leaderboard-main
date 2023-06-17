/*
The GamePreviewComponent. This "mini-card" displays small bits of information about a certain game and is used
throughout the site, including the home page, the favorite game, the search page, etc.

Information that is displayed on this card include:
- Game cover image (links to game page)
- Game title (links to game page)
- Release date
- Global rating (stars and numeric value)
- Add/Remove from backlog button

*/
import React from "react"
import { Box, Grid, Typography, Rating, Button, createTheme, ThemeProvider, SvgIcon, Divider } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { Add, Clear, DragHandle } from "@mui/icons-material"
import { useEffect, useState } from "react"

import { auth, db } from "../firebase.config"
import { arrayUnion, doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore"
import { removeBacklogGameFromRecommended } from "../helperFunctions/backlogRecommendation"
import IconButton from '@mui/material/IconButton';

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function GamePreviewComponent({ gameData, getBacklog, isUser, maxW }) {
	const navigate = useNavigate()
	let inBacklog = false

	// Get user (for user ID) if user is signed in
	const { currentUser } = auth
	const userID = currentUser.uid

	const [gameID, setGameID] = useState("")
	const [gameCover, setGameCover] = useState("")
	const [gameTitle, setGameTitle] = useState("")
	const [gameRating, setGameRating] = useState("")
	const [gameReleaseDate, setGameReleaseDate] = useState("")

	// Set State for backlog button
	const [inBacklogButton, setInBacklogButton] = useState(false) // default state shows "Add to backlog"

	// check if game is in backlog
	const getUserInfo = async () => {
		// document based method
		const userDocRef = doc(db, "users", userID)
		const docSnap = await getDoc(userDocRef)
		inBacklog = docSnap.get("backlog").includes(gameID)
	}

	getUserInfo()

	async function isGameInBacklog() {
		// get document method
		const userRef = doc(db, "users", userID)
		const docSnap = await getDoc(userRef)
		const existsInBacklog = docSnap.get("backlog").includes(gameData.id)

		if (existsInBacklog) {
			setInBacklogButton(true)
		} else {
			setInBacklogButton(false)
		}
	}

	useEffect(() => {
		const setRating = async () => {
			const gameSpecificReviewsDocRef = doc(db, "gameSpecificReviews", gameData.id.toString())
			const docSnap = await getDoc(gameSpecificReviewsDocRef)
			setGameRating(docSnap.exists() ? docSnap.data().globalRating.toFixed(1) : 0)
		}

		setGameID(gameData.id)
		setGameTitle(gameData.name)
		setGameCover(gameData.cover_url.replace("t_thumb", "t_1080p"))
		setGameReleaseDate(gameData.release_dates[0].y)

		setRating()
		isGameInBacklog()
	}, [])

	async function updateBacklog() {
		// get document method
		const userRef = doc(db, "users", userID)
		const docSnap = await getDoc(userRef)
		const existsInBacklog = docSnap.get("backlog").includes(gameID)

		if (existsInBacklog) {
			await updateDoc(userRef, {
				backlog: arrayRemove(gameID)
			})
			inBacklog = false
		} else {
			await updateDoc(userRef, {
				backlog: arrayUnion(gameID)
			})
			inBacklog = true
			removeBacklogGameFromRecommended(userID, gameID)
		}
		setInBacklogButton((prev) => !prev)
		if (getBacklog) {
			await getBacklog()
		}
	}

	return (
		<>
			{/* , background:'linear-gradient(#1b1b1b,#0f0f0f)' maxWidth: 400, minWidth: 350, maxWidth: 400, minWidth: 350, */}
			<Grid
				container
				rowSpacing={2}
				sx={{
					width: { xs: maxW ? maxW : 300, md: maxW ? maxW : (getBacklog && isUser ? 450 : 375) },
					borderRadius: 2,
					boxShadow: "0px 0px 15px #0f0f0f",
					background: "linear-gradient(#2e2e2e, transparent)",
					"&:hover": { boxShadow: "0px 0px 15px #4C2F97" }
				}}>
				{getBacklog && isUser && (
					<>
						<SvgIcon
							component={DragHandle}
							inheritViewBox
							sx={{
								mr: -1,
								width: { xs: 20, md: 25 },
								mt: "75px",
								color: "#A1A1A1",
								"&:hover": { cursor: "pointer" }
							}}
						/>
					</>
				)}


				<Grid item xs={3} align={"left"} sx={{ ml: 2, mr: 1, mb: 1 }}>
					<Box
						draggable={false}
						component="img"
						sx={{
							borderRadius: 2,
							"&:hover": { cursor: "pointer" },
							width: { xs: 75, md: 100 },
						}}
						src={gameCover}
						onClick={() => {
							navigate("/game/" + gameID)
						}}></Box>
				</Grid>
				<Grid item rowSpacing={2} xs={(getBacklog && isUser ? 7 : 8)} sx={{ width: { xs: 200, md: 300 } }}>
					<Grid item xs={12} align={"left"} sx={{ mb: -0.5 }}>
						<Button
							sx={{ textTransform: "none" }}
							onClick={() => {
								navigate("/game/" + gameID)
							}}>
							<Grid item xs={12}>
								<ThemeProvider theme={theme}>
									<Typography

										color="#fff"
										align={"left"}
										sx={{
											ml: { xs: 1, md: maxW ? 4 : 1 },
											fontSize: { xs: 15, md: 16 },
											overflow: "hidden",
											textOverflow: "ellipsis",
											display: "-webkit-box",
											WebkitLineClamp: "2",
											WebkitBoxOrient: "vertical",
											flexGrow: 1,
											height: 48,
											maxWidth: 200,
											textDecoration: "none",
											"&:hover": { textDecoration: "underline" }
										}}>
										{gameTitle}
									</Typography>

									<Typography
										component={"span"}
										color="#fff"
										align={"left"}
										sx={{
											ml: { xs: 1, md: maxW ? 4 : 1 },
											fontSize: { xs: 12, md: 14 },
											display: "-webkit-box",
											WebkitLineClamp: "2",
											WebkitBoxOrient: "vertical",
											flexGrow: 1,
											height: 22
										}}>
										{gameReleaseDate ? ` (${gameReleaseDate})` : ""}
									</Typography>
								</ThemeProvider>
							</Grid>
						</Button>
					</Grid>
					<Grid item xs={12} align={"left"} >
						<ThemeProvider theme={theme}>
							<Typography sx={{ flexGrow: 1, fontSize: 13.5, ml: { xs: 2, md: maxW ? 5 : 2 } }}>
								{gameRating !== 0 ? `Global Rating: ${gameRating}` : "No Ratings"}
							</Typography>
						</ThemeProvider>
						<Rating
							align="center"
							value={parseFloat(gameRating)}
							size="medium"
							precision={0.1}
							sx={{
								"& .MuiRating-iconFilled": {
									color: "#7952de"
								},
								"& .MuiRating-iconEmpty": {
									color: "#7952de"
								},
								ml: 4,
								display: "flex",
								ml: { xs: 2, md: maxW ? 5 : 2 }
							}}
							readOnly
						/>
					</Grid>
					<Grid item xs={12} align={"left"}>
						<IconButton size="large" onClick={() => {
							updateBacklog()
						}} sx={{ color: "#fff", ml: { xs: 1, md: maxW ? 3 : 1 } }}>
							{inBacklogButton ? (
								<>
									<Clear />
									<Typography fontSize={12} color="inherit" noWrap >
										Remove from backlog
									</Typography>
								</>
							) : (
								<>
									<Add />
									<Typography fontSize={12} color="inherit" >
										Add to backlog
									</Typography>
								</>
							)}
						</IconButton>
						{/* {inBacklogButton ? (
							<Button
								variant="text"
								size="small"
								sx={{ color: "white", m: 0, p: -1 }}
								onClick={() => {
									updateBacklog()
								}}>
								<Clear />
								<Typography component={"span"} variant="h" color="inherit" noWrap sx={{ mr: 3 }}>
									Remove from backlog
								</Typography>
							</Button>
						) : (
							<Button
								size="small"
								sx={{ color: "white", m: 0, p: 0, ml: 1 }}
								onClick={() => {
									updateBacklog()
								}}>
								<Add />
								<Typography component={"span"} variant="h" color="inherit" sx={{ mr: 3 }}>
									Add to backlog
								</Typography>
							</Button>
						)} */}
					</Grid>
				</Grid>
			</Grid>
		</>
	)
}

export default GamePreviewComponent
