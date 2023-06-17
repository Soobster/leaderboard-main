/*
The GlobalRatingsGraphComponent. This is displayed on the game page. The bar graph displays the ammount
of star ratings received for the game as well as the average star rating displayed numerically beneath
the graph.

*/
import { Box, Card, CardContent, Divider, ThemeProvider, Typography, createTheme } from "@mui/material"
import { Chart, BarSeries } from "@devexpress/dx-react-chart-material-ui"
import { Animation } from "@devexpress/dx-react-chart"
import "../App.css"
import StarIcon from "@mui/icons-material/Star"
import React from "react"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function GlobalRatingsGraphComponent({ gameRatings, globalRating }) {
	let chartData = []
	if (gameRatings) {
		chartData = [
			{ stars: "0.5", amount: gameRatings[0.5] + 0.1 },
			{ stars: "1", amount: gameRatings[1] + 0.1 },
			{ stars: "1.5", amount: gameRatings[1.5] + 0.1 },
			{ stars: "2", amount: gameRatings[2] + 0.1 },
			{ stars: "2.5", amount: gameRatings[2.5] + 0.1 },
			{ stars: "3", amount: gameRatings[3] + 0.1 },
			{ stars: "3.5", amount: gameRatings[3.5] + 0.1 },
			{ stars: "4", amount: gameRatings[4] + 0.1 },
			{ stars: "4.5", amount: gameRatings[4.5] + 0.1 },
			{ stars: "5", amount: gameRatings[5] + 0.1 }
		]
	}

	return (
		<Card className="box" sx={{ maxWidth: 250, minWidth: 100, bgcolor: "#252525", borderRadius: 2 }}>
			<CardContent>
				{/* Title */}
				<ThemeProvider theme={theme}>
					<Typography variant="h6" align="center" color="#FFFFFF">
						Global Ratings
					</Typography>
				</ThemeProvider>
				<Divider sx={{ borderBottomWidth: 2, mt: 1, ml: -1, mr: -1, bgcolor: "#a3a3a3" }} />
				{globalRating && gameRatings && (
					<>
						<Chart data={chartData} sx={{ maxHeight: 100, maxWidth: 200, color: "#a3a3a3" }}>
							<BarSeries valueField="amount" color="#7952de" argumentField="stars" />
							<Animation />
						</Chart>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								flexWrap: "wrap"
							}}>
							<Typography variant="h6" color="#FFFFFF">
								0.5
								<span>
									{" "}
									<StarIcon sx={{ color: "#7952de" }} />
								</span>
							</Typography>
							<Typography variant="h6" ml={14.75} color="#FFFFFF">
								5
								<span>
									{" "}
									<StarIcon sx={{ color: "#7952de" }} />
								</span>
							</Typography>
						</Box>
						<Typography variant="h6" align="center" color="#FFFFFF">
							Avg: {globalRating.toFixed(1)}
						</Typography>
					</>
				)}
				{!globalRating && (
					<ThemeProvider theme={theme}>
						<Typography align="center" color="#FFFFFF" sx={{ mt: 2 }}>
							No Reviews Yet
						</Typography>
					</ThemeProvider>
				)}
			</CardContent>
		</Card>
	)
}

export default GlobalRatingsGraphComponent
