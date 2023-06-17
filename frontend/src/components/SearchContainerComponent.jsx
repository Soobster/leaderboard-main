/*
The SearchContainerComponent. Displays the results of a search.

Displays the results of a search and will displays matching games, users and lists.
*/
import { Grid, Box, createTheme, ThemeProvider, Typography, SvgIcon } from "@mui/material"
import GamePreviewComponent from "../components/GamePreviewComponent"
import UserSearchResultComponent from "../components/UserSearchResultComponent"
import ListSearchResultComponent from "./ListSearchResultComponent"
import "../App.css"
import { SentimentVeryDissatisfied } from "@mui/icons-material"

import PropTypes from "prop-types"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { useState } from "react"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

// Displays the tabs in the component, which can be
function TabPanel(props) {
	const { children, value, index, ...other } = props
	return (
		<div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography component={"span"}>{children}</Typography>
				</Box>
			)}
		</div>
	)
}
TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired
}

// handles indexing in the tab
function a11yProps(index) {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`
	}
}

function SearchContainerComponent({ gameData, userResults, listResults, searchTerm }) {
	var gamesToShow = []
	var relevantGameData = []
	var usersToShow = []
	var relevantUserData = []
	var listsToShow = []
	var relevantListData = []

	const [value, setValue] = useState(0)

	// sets the value of the tab if changed
	const handleChange = (event, newValue) => {
		setValue(newValue)
	}

	if (gameData) {
		for (let i = 0; i < gameData.length; i++) {
			relevantGameData[i] = {
				id: gameData[i].id,
				name: gameData[i].name,
				cover_url: gameData[i].cover.url,
				rating: gameData[i].rating,
				release_dates: gameData[i].release_dates
			}
			gamesToShow.push(
				<Grid item md={5.5} xs={12} key={i} sx={{ mt: { md: 3, xs: 1 }, ml: { md: 2, xs: -3 }, mb: 2.5, align: "center" }}>
					<GamePreviewComponent gameData={relevantGameData[i]}></GamePreviewComponent>
				</Grid>
			)
		}
	}

	if (userResults) {
		for (let i = 0; i < userResults.length; i++) {
			relevantUserData[i] = {
				id: userResults[i].id,
				username: userResults[i].username,
				name: userResults[i].name,
				profilePic: userResults[i].profilePic,
				bio: userResults[i].bio
			}
			usersToShow.push(
				<Grid item md={6} xs={12} key={i} sx={{ mt: 1 }}>
					<UserSearchResultComponent userData={relevantUserData[i]}></UserSearchResultComponent>
				</Grid>
			)
		}
	}

	if (listResults) {
		for (let i = 0; i < listResults.length; i++) {
			relevantListData[i] = {
				id: listResults[i].id,
				name: listResults[i].name,
				list: listResults[i].list,
				listDescription: listResults[i].listDescription
			}
			listsToShow.push(
				<Grid>
					<ListSearchResultComponent listData={relevantListData[i]}></ListSearchResultComponent>
				</Grid>
			)
		}
	}

	return (
		<>
			<Grid
				className="box"
				borderRadius={2}
				container
				rowSpacing={1}
				columnSpacing={2}
				align={"center"}
				sx={{ mx: 3, width: "auto", mt: 3, mb: 3, maxWidth: 915 }}>
				<Grid item xs={12} align={"center"} sx={{ mx: 5, mt: 2, mb: 2, width: "auto" }}>
					<ThemeProvider theme={theme}>
						<Typography component={"span"} variant="h4" sx={{ flexGrow: 1 }}>
							Showing results for "{searchTerm}"
						</Typography>
					</ThemeProvider>
				</Grid>
				<Grid item xs={12}>
					<Box sx={{ width: "100%" }}>
						<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
							<Tabs value={value} onChange={handleChange} textColor="inherit">
								<Tab label="Games" {...a11yProps(0)} />
								<Tab label="Users" {...a11yProps(1)} />
								<Tab label="Lists" {...a11yProps(2)} />
							</Tabs>
						</Box>
						<TabPanel value={value} index={0} sx={{ width: "auto", maxWidth: 915 }}>
							{!gamesToShow.length ? (
								!gamesToShow.length && (
									<div>
										<SvgIcon component={SentimentVeryDissatisfied} inheritViewBox sx={{ width: 50, height: 75, mt: 2 }} />
										<Typography variant="h6" sx={{ flexGrow: 1, mt: 1, mb: 4 }}>
											No results
										</Typography>
									</div>
								)
							) : (
								<Grid container>{gamesToShow}</Grid>
							)}
						</TabPanel>
						<TabPanel value={value} index={1}>
							{!usersToShow.length ? (
								!usersToShow.length && (
									<>
										<SvgIcon component={SentimentVeryDissatisfied} inheritViewBox sx={{ width: 50, height: 75, mt: 2 }} />
										<Typography variant="h6" sx={{ flexGrow: 1, mt: 1, mb: 4 }}>
											No results
										</Typography>
									</>
								)
							) : (
								<Grid container>{usersToShow}</Grid>
							)}
						</TabPanel>
						<TabPanel value={value} index={2}>
							{!listsToShow.length ? (
								!listsToShow.length && (
									<>
										<SvgIcon component={SentimentVeryDissatisfied} inheritViewBox sx={{ width: 50, height: 75, mt: 2 }} />
										<Typography variant="h6" sx={{ flexGrow: 1, mt: 1, mb: 4 }}>
											No results
										</Typography>
									</>
								)
							) : (
								<Grid container>{listsToShow}</Grid>
							)}
						</TabPanel>
					</Box>
				</Grid>
			</Grid>
		</>
	)
}

export default SearchContainerComponent
