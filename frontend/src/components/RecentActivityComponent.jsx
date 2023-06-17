/*
	This shows the 3 (each) most recent activity from people you follow
	This will include star reviews, written reviews, tierlist creation, and list creation.
	
	Displayed on a user's profile page for their own reviews
	Displayed on the homepage for reviews from people they follow
	Displayed on game pages
*/

import { Grid, createTheme, ThemeProvider, Typography, Card, CardContent } from "@mui/material"
import "../App.css"
import ReviewComponent from "./ReviewComponent"
import SpinnerComponent from "./SpinnerComponent"
import { SentimentVeryDissatisfied } from "@mui/icons-material"
import StarReviewComponent from "../components/StarReviewComponent"
import PreviewListComponent from "../components/PreviewListComponent"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function RecentActivityComponent({ parentPage, isUser, username, activity, activityToShow, reloadReviews }) {
	var sectionHeader = ""

	if (parentPage.page === "HomePage") {
		sectionHeader = "Recent Activity From People You Follow"
	} else if (parentPage.page === "ProfilePage") {
		sectionHeader = isUser ? "Your Recent Activity" : `@${username}'s Recent Activity`
	} else if (parentPage.page === "GamePage") {
		sectionHeader = "Recent Reviews"
	}

	// JSX for showing all reviews for a game. appends to a list in html format
	function ShowAllActivity() {
		// if there are reviews to show, show a spinner until all games are populated
		if (activityToShow) {
			// if there's any reviews to show
			if (activity.length !== 0) {
				const rows = []
				for (let i = 0; i < activity.length; i++) {
					if (activity[i].type === "review") {
						if (activity[i]) {
							if (activity[i].review === "") {
								rows.push(
									<StarReviewComponent
										key={i}
										id={activity[i].id}
										rating={activity[i].rating}
										gameCover={activity[i].gameCover}
										gameTitle={activity[i].gameTitle}
										gameReleaseDate={activity[i].gameReleaseDate}
										userId={activity[i].userId}
										gameId={activity[i].gameId}
										profilePic={activity[i].profilePic}
										username={activity[i].username}
										name={activity[i].name}
										reloadReviews={reloadReviews}
										createdAt={activity[i].createdAt}
									/>
								)
							} else {
								rows.push(
									<ReviewComponent
										key={i}
										id={activity[i].id}
										reviewText={activity[i].review}
										rating={activity[i].rating}
										platform={activity[i].platform}
										hoursPlayed={activity[i].hoursPlayed}
										timesCompleted={activity[i].timesCompleted}
										positiveAttributes={activity[i].positiveAttributes}
										negativeAttributes={activity[i].negativeAttributes}
										upvotes={activity[i].upvotes}
										downvotes={activity[i].downvotes}
										gameCover={activity[i].gameCover}
										gameTitle={activity[i].gameTitle}
										gameReleaseDate={activity[i].gameReleaseDate}
										containsSpoiler={activity[i].containsSpoiler}
										userId={activity[i].userId}
										gameId={activity[i].gameId}
										profilePic={activity[i].profilePic}
										username={activity[i].username}
										name={activity[i].name}
										reloadReviews={reloadReviews}
										comments={activity[i].comments}
										createdAt={activity[i].createdAt}
									/>
								)
							}
						}
					} else if (activity[i].type === "tierlist") {
						rows.push(
							<PreviewListComponent
								key={i}
								type={"tierlist"}
								id={activity[i].id}
								upvotes={activity[i].upvotes}
								downvotes={activity[i].downvotes}
								title={activity[i].title}
								description={activity[i].description}
								preview={getTierListPreview(activity[i].listObj)}
								userId={activity[i].userId}
								profilePic={activity[i].profilePic}
								username={activity[i].username}
								name={activity[i].name}
								reloadLists={reloadReviews}
								comments={activity[i].comments}
								createdAt={activity[i].createdAt}
							/>
						)
					} else {
						rows.push(
							<PreviewListComponent
								key={i}
								type={"list"}
								id={activity[i].id}
								upvotes={activity[i].upvotes}
								downvotes={activity[i].downvotes}
								title={activity[i].title}
								description={activity[i].description}
								preview={getListPreview(activity[i].listObj)}
								userId={activity[i].userId}
								profilePic={activity[i].profilePic}
								username={activity[i].username}
								name={activity[i].name}
								reloadLists={reloadReviews}
								comments={activity[i].comments}
								createdAt={activity[i].createdAt}
							/>
						)
					}
				}

				return <>{rows}</>
			} else {
				return (
					<Card className="card" sx={{ bgcolor: "#252525", color: "#ffffff", width: "auto", borderRadius: 3, mb: 5, maxWidth: 915 }}>
						<CardContent>
							<SpinnerComponent override={{ position: "relative", margin: "50px" }} />
						</CardContent>
					</Card>
				)
			}
		}

		// otherwise there's no reviews to show at all, so say there's no reviews to display
		// along with a frowny face :(
		else
			return (
				<Card className="card" sx={{ bgcolor: "#252525", color: "#ffffff", width: "auto", borderRadius: 3, mb: 5, maxWidth: 915 }}>
					<CardContent>
						<SentimentVeryDissatisfied fontSize="large" />
						<ThemeProvider theme={theme}>
							<Typography>No Reviews to Display</Typography>
						</ThemeProvider>
					</CardContent>
				</Card>
			)
	}

	// returns a 3 item list with the first 3 gameCovers in the tier list object
	function getTierListPreview(list) {
		var output = []
		let i = 1
		let count = 0

		for (let k = 1; k < Object.keys(list).length; k++) {
			for (let j = 0; j < list[k].items.length; j++) {
				count++
				if (count >= 3) {
					break
				}
			}
			if (count >= 3) {
				break
			}
		}

		if (count === 1) {
			for (let k = 1; k < Object.keys(list).length; k++) {
				for (let j = 0; j < list[k].items.length; j++) {
					output.push(list[k].items[j].cover)
					if (output.length === 1) {
						break
					}
				}
				if (output.length === 1) {
					break
				}
			}
			output.push(output[0])
			output.push(output[0])
		} else if (count === 2) {
			for (let k = 1; k < Object.keys(list).length; k++) {
				for (let j = 0; j < list[k].items.length; j++) {
					output.push(list[k].items[j].cover)
					if (output.length === 2) {
						break
					}
				}
				if (output.length === 2) {
					break
				}
			}
			output.push(output[1])
		} else {
			while (output.length !== 3) {
				for (let j = 0; j < list[i].items.length; j++) {
					output.push(list[i].items[j].cover)
					if (output.length === 3) {
						break
					}
				}

				i++
			}
		}

		return output
	}

	// returns a 3 item list with the first 3 gameCovers in the list object
	function getListPreview(list) {
		var output = []

		for (let i = 0; i < list[0].items.length; i++) {
			output.push(list[0].items[i].cover)
			if (output >= 3) break
		}

		if (output.length === 1) {
			output.push(output[0])
			output.push(output[0])
		} else if (output.length === 2) {
			output.push(output[0])
		}

		return output
	}

	return (
		<div>
			<Grid className="box" borderRadius={3} container rowSpacing={2} sx={{ width: "auto", maxWidth: 915 }}>
				<Grid item xs={12} align={"center"}>
					<ThemeProvider theme={theme}>
						<Typography variant="h5" sx={{ flexGrow: 1 }}>
							{sectionHeader}
						</Typography>
					</ThemeProvider>
				</Grid>

				{/* next row, reviews listed under game */}
				<Grid item xs={12} align="center">
					<ShowAllActivity />
				</Grid>
			</Grid>
		</div>
	)
}

export default RecentActivityComponent
