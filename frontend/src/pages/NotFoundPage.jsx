/*
The NotFoundPage. This page displays when a bad url is taken, or the redirect
does not exist within leaderboard. It's the 404 Not Found page that many websites use
*/

import React from "react"
import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import Footer from "../components/FooterComponent"
import { Grid, Typography, SvgIcon, Button, Box } from "@mui/material"
import { SentimentVeryDissatisfied } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

function NotFoundPage() {
	const navigate = useNavigate()

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
							justifyContent="center"
							container
							rowSpacing={1}
							columnSpacing={2}
							align={"center"}
							sx={{ mx: 3, width: "auto", mt: 3, mb: 3, maxWidth: 915 }}>
							<Grid item xs={12} align={"center"} sx={{ mx: 5, mt: 2, mb: 2, width: "auto" }}>
								<SvgIcon component={SentimentVeryDissatisfied} inheritViewBox sx={{ width: 50, height: 75, mt: 2 }} />
								<Typography variant="h6" sx={{ flexGrow: 1, mt: 1, mb: 4 }}>
									Sorry, but the page you requested is in another castle
								</Typography>
								<Button
									sx={{
										flexGrow: 1, borderRadius: 2, background: "linear-gradient(#4f319b,#362269)", color: "#fff", mt: -1, mb: 1, mr: 1, boxShadow: '0px 0px 15px #151515',
									}}
									onClick={() => { navigate("/") }}>
									<Typography sx={{ mb: -.25, fontSize: 15, textTransform: 'none' }}>
										Respawn
									</Typography>
								</Button>
								<Typography color="#FFF" align="center" sx={{ mt: 1, fontSize: 12 }}>
									{"(Return to homepage)"}
								</Typography>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</div>
			<Footer />
		</>
	)
}

export default NotFoundPage
