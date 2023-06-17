/*
The RecommnedPage. This page is a full view of the recommened for you component on the HomePage.

Contained within are all the games that the site thinks this user will enjoy, based on the games 
that the user has previously rated highly. This shows a maximum of 20 games
*/

import React, { useEffect, useState } from "react"
import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import { Grid, createTheme, ThemeProvider, Typography, SvgIcon } from "@mui/material"
import Footer from "../components/FooterComponent"
import GamePreviewComponent from "../components/GamePreviewComponent"
import SpinnerComponent from "../components/SpinnerComponent"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase.config"
import { RecommendOutlined } from "@mui/icons-material"
import { checkGameCache } from "../helperFunctions/checkGameCache"

function RecommendedPage() {
	var gamesToShow = []
	var relevantGameData = []
	const { currentUser } = auth
	const userID = currentUser.uid
	const [gameData, setGameData] = useState(null)
	const [gameIds, setGameIds] = useState(null)

	// header font
	const theme = createTheme({
		typography: {
			fontFamily: "Josefin Sans"
		}
	})

	// number font
	const numberTheme = createTheme({
		typography: {
			fontFamily: "Josefin Sans",
			fontSize: 24
		}
	})

	// use effect for getting the recommened games from the db
	useEffect(() => {
		const getRecommendedIds = async () => {
			// query based method
			const ref = doc(db, "users", userID)
			const snap = await getDoc(ref)
			setGameIds(snap.data().topRecommended.slice(0, 20))
		}
		getRecommendedIds()
	}, [])

	// use effect for getting the game data for each game
	useEffect(() => {
		let subscribed = true
		const fetchGameData = async () => {
			if (gameIds.length) {
				const fetchedData = await checkGameCache(gameIds)
				if (subscribed) {
					const recommendedGames = fetchedData.filter((game) => gameIds.includes(`${game.id}`))
					let correctFetchedData = new Array(gameIds.length)
					recommendedGames.forEach((game) => (correctFetchedData[gameIds.indexOf(`${game.id}`)] = game))
					setGameData(correctFetchedData)
				}
			} else setGameData(gameIds)
		}
		if (gameIds) fetchGameData()

		return () => {
			subscribed = false
		}
	}, [gameIds])

	// shows all games, or a placeholder until the user has some games to be recommened
	if (gameData) {
		if (gameData.length) {
			for (let i = 0; i < gameData.length; i++) {
				relevantGameData[i] = {
					id: gameData[i].id,
					name: gameData[i].name,
					cover_url: gameData[i].cover.url,
					rating: gameData[i].rating,
					release_dates: gameData[i].release_dates
				}
				gamesToShow.push(
					<Grid container item md={6} xs={12} key={i} ml={{ md: 0, xs: -1 }}>
						<Grid item xs={12} md={1.3} align="left" ml={{ md: 0, xs: 2 }}>
							<ThemeProvider theme={numberTheme}>
								<Typography
									sx={{
										mt: { md: 1, xs: -4 },
										ml: -1,
										fontSize: { md: 25, xs: 20 }
									}}>
									#{i + 1}
								</Typography>
							</ThemeProvider>
						</Grid>
						<Grid item xs={12} md={10} sx={{ mt: 2, mb: 5 }}>
							<GamePreviewComponent gameData={relevantGameData[i]}></GamePreviewComponent>
						</Grid>
					</Grid>
				)
			}
		} else {
			gamesToShow.push(
				<Grid item xs={12} key={"key"} align={"center"}>
					<SvgIcon component={RecommendOutlined} sx={{ width: 50, height: 75, mt: 2 }} />
					<ThemeProvider theme={theme}>
						<Typography sx={{ flexGrow: 1, mt: 1, mb: 4, fontSize: 18 }}>
							Ready to get personalized game recommendations? <br />
							Just leave a review for some games first.
						</Typography>
					</ThemeProvider>
				</Grid>
			)
		}
	}

	return (
		<>
			<div className="content-wrapper">
				<Navbar />
				<SideNav />
				<Grid container rowSpacing={1} columnSpacing={2} sx={{ width: "auto", mb: 3 }}>
					<Grid item xs={12} align={"center"}>
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
										Recommended For You
									</Typography>
									{gameData === null && <SpinnerComponent override={{ position: "relative", margin: "50px" }} />}
								</ThemeProvider>
							</Grid>
							<Grid item xs={12} align={"center"} sx={{ mt: 1, mb: 1, width: "auto" }}></Grid>
							{gamesToShow && <>{gamesToShow}</>}
						</Grid>
					</Grid>
				</Grid>
			</div>
			<Footer />
		</>
	)
}

export default RecommendedPage
