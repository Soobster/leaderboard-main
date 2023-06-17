
/*
The Trending Games component. To be displayed at the top of the home page.

This shows the top 3 trending games and provides redirection to the trending games page.

*/
import { Typography, ThemeProvider, Button, createTheme, Grid, SvgIcon } from "@mui/material"
import React, { useEffect, useState } from "react"
import GamePreviewComponent from "./GamePreviewComponent"
import "../App.css"
import { useNavigate } from "react-router-dom"
import { TrendingUpRounded } from "@mui/icons-material"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function TrendingComponent({ gameData }) {
	const [game1, setGame1] = useState(null)
	const [game2, setGame2] = useState(null)
	const [game3, setGame3] = useState(null)
	const navigate = useNavigate()

	// set the game data to be displayed
	useEffect(() => {
		if (gameData.length) {
			setGame1({
				id: gameData[0].id,
				name: gameData[0].name,
				cover_url: gameData[0].cover.url,
				rating: gameData[0].rating,
				release_dates: gameData[0].release_dates
			})

			setGame2({
				id: gameData[1].id,
				name: gameData[1].name,
				cover_url: gameData[1].cover.url,
				rating: gameData[1].rating,
				release_dates: gameData[1].release_dates
			})

			setGame3({
				id: gameData[2].id,
				name: gameData[2].name,
				cover_url: gameData[2].cover.url,
				rating: gameData[2].rating,
				release_dates: gameData[2].release_dates
			})
		}
	}, [gameData])

	return (
		<>
			<Grid className="box" borderRadius={2} container rowSpacing={2} sx={{ width: "auto", maxWidth: 915 }}>
				<Grid item xs={12} align={"center"}>
					<ThemeProvider theme={theme}>
						<Typography variant="h5" sx={{ flexGrow: 1 }}>
							Trending Games
						</Typography>
					</ThemeProvider>
				</Grid>
				{game1 && game2 && game3 && (
					<>
						<Grid item xs={12} md={4} align={"center"} sx={{ mt: 1, mb: 1 }}>
							<GamePreviewComponent maxW={290} gameData={game1}></GamePreviewComponent>
						</Grid>
						<Grid item xs={12} md={4} align={"center"} sx={{ mt: 1, mb: 1 }}>
							<GamePreviewComponent maxW={290} gameData={game2}></GamePreviewComponent>
						</Grid>
						<Grid item xs={12} md={4} align={"center"} sx={{ mt: 1, mb: 1 }}>
							<GamePreviewComponent maxW={290} gameData={game3}></GamePreviewComponent>
						</Grid>
					</>
				)}
				{/* in case there are no trending games  */}
				{!gameData.length && (
					<>
						<Grid item xs={12} align={"center"}>
							<SvgIcon component={TrendingUpRounded} sx={{ width: 50, height: 75, mt: 2 }} />
							<ThemeProvider theme={theme}>
								<Typography sx={{ flexGrow: 1, mt: 1, mb: 4, fontSize: 17 }}>No currently trending games.</Typography>
							</ThemeProvider>
						</Grid>
					</>
				)}
				{/* button to redirect to trending games page */}
				<Grid item xs={12} align={"right"}>
					<Button
						sx={{
							flexGrow: 1,
							borderRadius: 2,
							background: "linear-gradient(#313131,#252525)",
							color: "#aaa",
							mt: -1,
							mb: 1,
							mr: 1,
							boxShadow: "0px 0px 15px #151515",
							"&:hover": { color: "#fff", background: "linear-gradient(#4f319b,#362269)" }
						}}
						onClick={() => {
							navigate("/trending")
						}}>
						<Typography sx={{ mb: -0.25, fontSize: 13, textTransform: "none" }}>See more</Typography>
					</Button>
				</Grid>
			</Grid>
		</>
	)
}

export default TrendingComponent
