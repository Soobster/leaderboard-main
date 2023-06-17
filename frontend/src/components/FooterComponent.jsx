/*
The FooterComponent. This displays at the bottom of each web page on the site.

There are links to the About Us page, the IGDB info page, and the FAQ page.

*/
import React from "react"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import { Typography } from "@mui/material"

const Footer = () => {
	return (
		<footer data-testid="footer-test">
			<Box sx={{ alignSelf: "stretch", height: { sm: 130, xs: 130 }, backgroundColor: "#1e1e1e" }} color="white">

				{/* Leaderboard Logo */}

				<Grid container display="flex" align="center" >
					<Grid item xs={12}>
						<Box height={60}>
							<img
								style={{ padding: 7, alignSelf: "flex-start" }}
								src={require("../assets/Leaderboard_Logos/logo_black_purple_transparent.png")}
								width={50}
								alt={"Leaderboard logo"}></img>
						</Box>
					</Grid>

					<Grid item xs={12}>
						<Grid container spacing={5} maxWidth={915} align="left" pt={.8}>
							<Grid item sm={5.75} xs={5.5} sx={{ ml: { sm: 1, xs: 1 }}}>
								<Box borderBottom={1} color="inherit" sx={{ fontFamily: "Josefin Sans", mb: .5 }}>
									<h2>About Us</h2>
								</Box>
								<Box>
									<Link
										href="/aboutus"
										color="inherit"
										sx={{ textDecoration: "none", fontFamily: "Helvetica", "&:hover": { textDecoration: "underline" } }}>
										Team
									</Link>
								</Box>
							</Grid>
							<Grid item sm={5.75} xs={5.5} sx={{ mr: { sm: 1, xs: 1 }}}>
								<Box borderBottom={1} color="inherit" sx={{ fontFamily: "Josefin Sans", mb: .5 }}>
									<h2>Resources</h2>
								</Box>
								<Box>
									<Link
										href="https://api-docs.igdb.com/#about"
										color="inherit"
										sx={{ textDecoration: "none", fontFamily: "Helvetica", "&:hover": { textDecoration: "underline" } }}>
										IGDB
									</Link>
									<Typography display={"inline"}>  |  </Typography>
									<Link
										href="/FAQ"
										color="inherit"
										sx={{ textDecoration: "none", fontFamily: "Helvetica", "&:hover": { textDecoration: "underline" } }}>
										FAQ
									</Link>
								</Box>
							</Grid>
						</Grid>
					</Grid>
				</Grid>

			</Box>
		</footer>
	)
}
export default Footer

// References:
// - Text formatting: stackoverflow.com/questions/37669391/how-to-get-rid-of-underline-for-link-component-of-react-router
// - Structure: www.youtube.com/watch?v=HCsFwwolXZw
