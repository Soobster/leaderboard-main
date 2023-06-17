/*
The ScrollableImageComponent. Displays the screenshots related to a game.

*/

import Carousel from "react-material-ui-carousel"
import { Card, CardContent, Typography, ThemeProvider, createTheme, Box, Modal, Fade } from "@mui/material"
import { SentimentVeryDissatisfied } from "@mui/icons-material"
import { useState } from "react"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

// Shows the screenshots of a game in a carousel
function ScrollableImageComponent(props) {
	if (props.screenshots.length === 0) return <NoScreenshotsJSX></NoScreenshotsJSX>
	return (
		<>
			<Carousel
				navButtonsAlwaysVisible
				indicatorContainerProps={{
					style: {
						marginTop: "-50px",
						textAlign: "center"
					}
				}}
				indicatorIconButtonProps={{
					style: {
						color: "#7952de"
					}
				}}
				activeIndicatorIconButtonProps={{
					style: {
						backgroundColor: "white"
					}
				}}>
				{props.screenshots.map((image, i) => (
					<Screenshot key={i} image={image} />
				))}
			</Carousel>
		</>
	)
}

function Screenshot(props) {
	// state and open and close handlers for opening the image
	const [openFullImage, setOpenFullImage] = useState(false)

	// handles opening a modal to show full screenshot
	const handleClickOpenFullImage = () => {
		setOpenFullImage(true)
	}

	// handles closing a modal to show full screenshot
	const handleCloseOpenFullImage = () => {
		setOpenFullImage(false)
	}

	return (
		<>
			<Modal
				open={openFullImage}
				onClose={handleCloseOpenFullImage}
				closeAfterTransition
				sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
				<Fade in={openFullImage} timeout={500}>
					<img
						src={props.image}
						alt="asd"
						style={{
							maxHeight: "90%",
							maxWidth: "90%"
						}}
					/>
				</Fade>
			</Modal>

			<Box
				component="img"
				sx={{
					backgroundColor: "#FFF",
					borderRadius: 3,
					maxHeight: "90%",
					maxWidth: "90%",
					height: 275
				}}
				onClick={handleClickOpenFullImage}
				src={props.image}></Box>
		</>
	)
}

// To be displayed if there is no screenshots associated with a game
const NoScreenshotsJSX = () => {
	return (
		<Card className="card" sx={{ bgcolor: "#252525", color: "#fff", width: "auto", borderRadius: 3, mb: 5, maxWidth: 800 }}>
			<CardContent>
				<SentimentVeryDissatisfied fontSize="large" />

				<ThemeProvider theme={theme}>
					<Typography>No Screenshots to Display</Typography>
				</ThemeProvider>
			</CardContent>
		</Card>
	)
}

export default ScrollableImageComponent

// Modal repurposed from https://codesandbox.io/s/gzsns?file=/src/App.js:1209-1664
