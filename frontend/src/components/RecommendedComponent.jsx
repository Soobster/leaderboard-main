/*
The RecommendedComponent. It displays a preview of at most 3 of the user's top recommended games 
according to Leaderboard.
*/

import React from "react"
import { Grid, Typography, ThemeProvider, Button, createTheme, SvgIcon } from "@mui/material"
import GamePreviewComponent from "./GamePreviewComponent"
import "../App.css"
import { useState } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { RecommendOutlined } from "@mui/icons-material"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function RecommendedComponent({ gameData }) {
	const [game1, setGame1] = useState(null)
	const [game2, setGame2] = useState(null)
	const [game3, setGame3] = useState(null)
	const navigate = useNavigate()

	// takes in at most 3 games to display in the component
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
							Recommended For You
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
				{!gameData.length && (
					<>
						<Grid item xs={12} align={"center"}>
							<SvgIcon component={RecommendOutlined} sx={{ width: 50, height: 75, mt: 2 }} />
							<ThemeProvider theme={theme}>
								<Typography sx={{ flexGrow: 1, mt: 1, mb: 4, fontSize: 17 }}>
									Ready to get personalized game recommendations? <br />
									Just leave a review for some games first.
								</Typography>
							</ThemeProvider>
						</Grid>
					</>
				)}
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
							navigate("/recommended")
						}}>
						<Typography sx={{ mb: -0.25, fontSize: 13, textTransform: "none" }}>See more</Typography>
					</Button>
				</Grid>
			</Grid>
		</>
	)
}

export default RecommendedComponent
