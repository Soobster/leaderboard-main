/*
The SortReviewsComponent. This displays whenever there's a time to sort all reviews. 

The user can sort these reviews by Recent, Highest Rated, Lowest Rated,
Controversial, Following, Star Range, and Tags

After selecting these, the text on the left side reflects the change made to sorting

*/

import { createTheme, FormControl, Grid, MenuItem, Rating, Select, ThemeProvider, Typography } from "@mui/material"
import { useState } from "react"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function SortReviewsComponent({ setSortOption, setMin, setMax, min, max, showFollowingOption, showContoversialOption, showTagsOption }) {
	// States for sorting and displaying text
	const [sortBy, setSortBy] = useState("Oldest")
	const [reviewSortingText, setReviewSortingText] = useState("Oldest Reviews")

	// handler for changing the text when selecting different sorting options
	const handleSortByChange = (event) => {
		setSortBy(event.target.value)

		if (event.target.value === "Following") {
			setReviewSortingText("Reviews by People You Follow")
		} else if (event.target.value === "Tags") {
			setReviewSortingText("Tagged Reviews")
		} else {
			setReviewSortingText(event.target.value + " Reviews")
		}
		setSortOption(event.target.value)
	}
	return (
		<>
			<Grid container sx={{ width: "auto", maxWidth: 915 }}>
				{/* Tells you how the reviews are being sorted */}
				<Grid item xs={12} md={5} align="left" sx={{ ml: 3 }}>
					<ThemeProvider theme={theme}>
						<Typography fontSize={"28px"} sx={{ mt: 3, color: "#fff" }}>
							{reviewSortingText}
						</Typography>
					</ThemeProvider>
				</Grid>

				<Grid item xs={12} md={3} sx={{ mt: 1, mb: 1 }}>
					{sortBy == "Star Range" && (
						<div>
							<Grid container sx={{ width: "auto" }}>
								<Grid item xs={7} sx={{ mt: 1, mb: 1, ml: -0.75 }}>
									<Typography color="#fff">
										Min:
										<br />
										<Rating
											name="simple-controlled"
											value={min}
											precision={0.5}
											size="small"
											sx={{
												"& .MuiRating-iconFilled": {
													color: "#7952de"
												},
												"& .MuiRating-iconEmpty": {
													color: "#7952de"
												}
											}}
											onChange={(event, newValue) => {
												setMin(newValue)
											}}
										/>
									</Typography>
								</Grid>
								<Grid item xs={6} sx={{}}>
									<Typography color="#fff">
										Max:
										<Rating
											name="simple-controlled"
											value={max}
											precision={0.5}
											size="small"
											sx={{
												ml: -0.75,
												"& .MuiRating-iconFilled": {
													color: "#7952de"
												},
												"& .MuiRating-iconEmpty": {
													color: "#7952de"
												}
											}}
											onChange={(event, newValue) => {
												setMax(newValue)
											}}
										/>
									</Typography>
								</Grid>
							</Grid>
						</div>
					)}
				</Grid>

				{/* Sort by options */}
				<Grid item xs={12} md={3} sx={{ mt: 1, mb: 1 }} align="left">
					<Typography color="#fff" align="left" ml={1}>
						Sort and filter:
					</Typography>
					<FormControl sx={{ background: "linear-gradient(#494949, #292929)", boxShadow: "0px 0px 15px #0f0f0f", minWidth: 100, borderRadius: 3 }}>
						<Select
							value={sortBy}
							displayEmpty
							onChange={handleSortByChange}
							inputProps={{ "aria-label": "Without label" }}
							sx={{ background: "linear-gradient(#494949, #292929)", color: "#fff" }}>
							<MenuItem value={"Oldest"}>Oldest</MenuItem>
							<MenuItem value={"Newest"}>Newest</MenuItem>
							<MenuItem value={"Highest Rated"}>Highest Rated</MenuItem>
							<MenuItem value={"Lowest Rated"}>Lowest Rated</MenuItem>
							{showFollowingOption && <MenuItem value={"Following"}>Following</MenuItem>}
							{showTagsOption && <MenuItem value={"Tags"}>Tags</MenuItem>}
							{showContoversialOption && <MenuItem value={"Controversial"}>Controversial</MenuItem>}
							<MenuItem value={"Star Range"}>Star Range</MenuItem>
						</Select>
					</FormControl>
				</Grid>
			</Grid>
		</>
	)
}

export default SortReviewsComponent
