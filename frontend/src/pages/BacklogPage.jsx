/*
The Backlog Page. This shows the backlog component. 

The ordering of the backlog is editable if a user is viewing their own backlog.

This page is loaded when a user clicks on the "See more" button on the backlog preview component, or when 
the backlog icon is clicked in the navigation hamburger menu or side navigation. 
*/
import React from "react"
import Navbar from "../components/NavbarComponent"
import { Grid } from "@mui/material"
import BacklogComponent from "../components/BacklogComponent"
import Footer from "../components/FooterComponent"
import SideNav from "../components/SideNavComponent"

function BacklogPage() {
	return (
		<>
			<div className="content-wrapper">
				<Navbar />
				<SideNav />
				<Grid container rowSpacing={1} columnSpacing={2} sx={{ width: "auto", mb: 3 }}>
					<Grid item xs={12} align={"center"}>
						<BacklogComponent />
					</Grid>
				</Grid>
			</div>

			<Footer />
		</>
	)
}

export default BacklogPage
