/*
The BacklogPreviewComponent. This displays up to the first three games listed in a users backlog
on their profile page. If the backlog is empty, this component will say so instead of appearing
blank.

Clicking on "See more" will take the user to the displayed user's full backlog

*/
import React, { useEffect, useState } from "react"
import GamePreviewComponent from "./GamePreviewComponent"
import { Grid, Typography, ThemeProvider, Button, createTheme, SvgIcon } from "@mui/material"
import "../App.css"
import { useNavigate } from "react-router-dom"
import { SentimentVeryDissatisfied } from "@mui/icons-material"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function BacklogPreviewComponent({ gameData, username, isUser }) {
	const navigate = useNavigate()
	const [game1, setGame1] = useState(null)
	const [game2, setGame2] = useState(null)
	const [game3, setGame3] = useState(null)

	useEffect(() => {
		if (gameData.length) {
			setGame1({
				id: gameData[0].id,
				name: gameData[0].name,
				cover_url: gameData[0].cover.url,
				rating: gameData[0].rating,
				release_dates: gameData[0].release_dates
			})

			if (gameData.length > 1) {
				setGame2({
					id: gameData[1].id,
					name: gameData[1].name,
					cover_url: gameData[1].cover.url,
					rating: gameData[1].rating,
					release_dates: gameData[1].release_dates
				})
			}

			if (gameData.length > 2) {
				setGame3({
					id: gameData[2].id,
					name: gameData[2].name,
					cover_url: gameData[2].cover.url,
					rating: gameData[2].rating,
					release_dates: gameData[2].release_dates
				})
			}
		}
	}, [gameData])

	if (game1) {
		return (
			<div>
				<Grid className="box" borderRadius={2} rowSpacing={2} container sx={{ width: "auto", maxWidth: 915 }}>
					<Grid item xs={12} align={"center"}>
						<ThemeProvider theme={theme}>
							<Typography variant="h5" sx={{ flexGrow: 1 }}>
								Backlog
							</Typography>
						</ThemeProvider>
					</Grid>
					{game1 && game2 && game3 ? (
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
					) : (
						<>
							{game1 && game2 ? (
								<>
									<Grid item xs={12} md={6} align={"center"} sx={{ mt: 1, mb: 1 }}>
										<GamePreviewComponent gameData={game1}></GamePreviewComponent>
									</Grid>
									<Grid item xs={12} md={6} align={"center"} sx={{ mt: 1, mb: 1 }}>
										<GamePreviewComponent gameData={game2}></GamePreviewComponent>
									</Grid>
								</>
							) : (
								<>
									{game1 ? (
										<Grid item xs={12} md={6} align={"center"} sx={{ mt: 1, mb: 1 }}>
											<GamePreviewComponent gameData={game1}></GamePreviewComponent>
										</Grid>
									) : (
										<></>
									)}{" "}
								</>
							)}
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
								navigate(`/${username}/backlog`)
							}}>
							<Typography sx={{ mb: -0.25, fontSize: 13, textTransform: "none" }}>See more</Typography>
						</Button>
					</Grid>
				</Grid>
			</div>
		)
	} else {
		return (
			<div>
				<Grid className="box" borderRadius={3} container rowSpacing={2} sx={{ width: "auto", maxWidth: 915 }}>
					<Grid item xs={12} align={"center"}>
						<ThemeProvider theme={theme}>
							<Typography variant="h5" sx={{ flexGrow: 1 }}>
								Backlog
							</Typography>
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
						</ThemeProvider>
					</Grid>
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
								navigate(`/${username}/backlog`)
							}}>
							<Typography sx={{ mb: -0.25, fontSize: 13, textTransform: "none" }}>See more</Typography>
						</Button>
					</Grid>
				</Grid>
			</div>
		)
	}
}

export default BacklogPreviewComponent
