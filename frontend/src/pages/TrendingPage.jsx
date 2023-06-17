/*
The TrendingPage. This page is a full view of the Trending component on the HomePage.

Contained within are the top 10 games that have been highly rated this past week
*/

import React, { useEffect, useState } from "react"
import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import { Grid, createTheme, ThemeProvider, Typography, SvgIcon } from "@mui/material"
import Footer from "../components/FooterComponent"
import GamePreviewComponent from "../components/GamePreviewComponent"
import SpinnerComponent from "../components/SpinnerComponent"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase.config"
import { TrendingUpRounded } from "@mui/icons-material"
import { checkGameCache } from "../helperFunctions/checkGameCache"

function TrendingPage() {
	var gamesToShow = []
	var relevantGameData = []
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

	// use effect for getting the trending games
	useEffect(() => {
		const getHighestRatedIds = async () => {
			// query based method
			const ref = doc(db, "highestRated", "games")
			const snap = await getDoc(ref)
			setGameIds(snap.data().top10)
		}
		getHighestRatedIds()
	}, [])

	// use effect for getting the game data for the trending games
	useEffect(() => {
		let subscribed = true
		const fetchGameData = async () => {
			if (gameIds.length) {
				const fetchedData = await checkGameCache(gameIds)
				if (subscribed) {
					const highestRatedGames = fetchedData.filter((game) => gameIds.includes(`${game.id}`))
					let correctFetchedData = new Array(gameIds.length)
					highestRatedGames.forEach((game) => (correctFetchedData[gameIds.indexOf(`${game.id}`)] = game))
					setGameData(correctFetchedData)
				}
			} else setGameData(gameIds)
		}
		if (gameIds) fetchGameData()
		return () => {
			subscribed = false
		}
	}, [gameIds])

	// shows all games, or a placeholder until there are some trending games
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
							<GamePreviewComponent gameData={relevantGameData[i]} />
						</Grid>
					</Grid>
				)
			}
		} else {
			gamesToShow.push(
				<Grid item xs={12} key={"key"} align={"center"}>
					<SvgIcon component={TrendingUpRounded} sx={{ width: 50, height: 75, mt: 2 }} />
					<ThemeProvider theme={theme}>
						<Typography sx={{ flexGrow: 1, mt: 1, mb: 4, fontSize: 18 }}>No currently trending games.</Typography>
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
							container
							borderRadius={3}
							rowSpacing={1}
							columnSpacing={2}
							align={"center"}
							sx={{ mx: 3, width: "auto", mt: 3, mb: 3, maxWidth: 915 }}>
							<Grid item xs={12} align={"center"} sx={{ mx: 5, mt: 1, mb: 1, width: "auto" }}>
								<ThemeProvider theme={theme}>
									<Typography variant="h5" sx={{ flexGrow: 1 }}>
										Trending Games
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

export default TrendingPage
