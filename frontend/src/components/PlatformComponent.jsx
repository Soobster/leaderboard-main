/*
The Platform Component. This displays when the user visits any game page. The card displays all the platforms this
game is able to be played on in a list format.

The user can click on a platform, and they will be redirected to a page showing all the games for that platform. 
*/

import { Card, CardContent, Divider, List, ListItem, ThemeProvider, ListItemText, Typography, createTheme } from "@mui/material"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

/**
 *
 * Returns a list of platforms a game can be played in.
 * Example of props.platforms: ["GameCube", "Playstation 2", "Wii", "Xbox 360", "Switch"]
 */
function PlatformComponent(props) {
	// Takes in a list and returns a JSX formated version of it
	const listPlats = props.platforms.map((string) => (
		<ListItem component="div" key={string.toString()} disablePadding>
			<ListItemText align="center">{string}</ListItemText>
		</ListItem>
	))

	return (
		<Card className="box" sx={{ bgcolor: "#252525", color: "#ffffff", maxWidth: 250, minWidth: 100, borderRadius: 2 }}>
			<CardContent>
				<ThemeProvider theme={theme}>
					<Typography variant="h6" align="center" color="#FFFFFF">
						Platforms
					</Typography>
				</ThemeProvider>

				<Divider sx={{ borderBottomWidth: 2, mt: 1, ml: -1, mr: -1, mb: 1, bgcolor: "#a3a3a3" }} />
				<List sx={{ maxHeight: 150, overflow: "auto" }}>
					{/* Display the list here */}
					{listPlats}
				</List>
			</CardContent>
		</Card>
	)
}

export default PlatformComponent
