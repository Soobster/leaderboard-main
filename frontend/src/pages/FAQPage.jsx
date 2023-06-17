/*
The FAQPage. This displays a set of questions a new user may have about using the site or its
available features. Questions are initially collapsed in an MUI acordion and can be expanded
to display comments addressing the question and screenshots to provide additional context.

*/
import Footer from "../components/FooterComponent"
import { Grid, Typography, ThemeProvider, createTheme, Button, Box } from "@mui/material"
import { useNavigate } from "react-router-dom"

import WriteReview from "../assets/FAQ/WriteReview.png"
import AddToList from "../assets/FAQ/AddToList.png"
import CreateList from "../assets/FAQ/CreateList.png"
import SearchTerm from "../assets/FAQ/SearchTerm.png"
import Follow from "../assets/FAQ/Follow.png"
import AllGames from "../assets/FAQ/AllGames.png"
import Following from "../assets/FAQ/Following.png"
import Backlog1 from "../assets/FAQ/Backlog1.png"
import Backlog2 from "../assets/FAQ/Backlog2.png"

import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans",
		fontSize: 20
	}
})

function FAQPage() {
	const navigate = useNavigate()

	return (
		<>
			<div className="content-wrapper">
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
							<Grid xs={12}>
								<Box borderBottom={1} sx={{ width: "85%", mb: 2 }}>
									<ThemeProvider theme={theme}>
										<Typography variant="h5" sx={{ mt: 2 }}>
											FAQ
										</Typography>
									</ThemeProvider>
								</Box>

								<Grid xs={12}>
									<Box sx={{ width: "85%", mb: 2 }}>
										<Typography fontSize={20} sx={{ mt: 2 }} align="center">
											This page contains common questions users may have about how to use Leaderboard to its fullest.
										</Typography>
									</Box>
								</Grid>
							</Grid>

							<Accordion sx={{ ml: 2, mr: 2, boxShadow: 10 }}>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
									aria-controls="panel1a-content"
									id="panel1a-header"
									sx={{ background: "#2a2a2a" }}>
									<ThemeProvider theme={theme}>
										<Typography fontSize={30} sx={{ mt: 2, color: "#FFF", borderRadius: 4 }}>
											How do I write a review?
										</Typography>
									</ThemeProvider>
								</AccordionSummary>
								<AccordionDetails sx={{ background: "#1E1E1E" }}>
									<Grid xs={12}>
										<Box sx={{ width: "92%", mb: 2 }}>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												In order to write a review for a game, first you need to navigate to the appropriate game page. When you have
												found the game page you want, simply click "Write a Review..." in the action box on the right. A dialog box will
												display an area where you can type your thoughts about this game. Additional information can be added to your
												review like platform, hours played, etc. A number of stars for the title is required for publishing a review.
												Alternatively, if you don't want to write a review, you can simply give the title a star rating by clicking the
												star selector at the top of the action box.
											</Typography>
											<img src={WriteReview} alt={"WriteReviewImg"} width={"100%"} />
										</Box>
									</Grid>
								</AccordionDetails>
							</Accordion>

							<Accordion sx={{ ml: 2, mr: 2, boxShadow: 10 }}>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
									aria-controls="panel1a-content"
									id="panel1a-header"
									sx={{ background: "#2a2a2a" }}>
									<ThemeProvider theme={theme}>
										<Typography fontSize={30} sx={{ mt: 2, color: "#FFF", borderRadius: 4 }}>
											How do I create a Tier List?
										</Typography>
									</ThemeProvider>
								</AccordionSummary>
								<AccordionDetails sx={{ background: "#1E1E1E" }}>
									<Grid xs={12}>
										<Box sx={{ width: "92%", mb: 2 }}>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												There are several ways you can create a Tier List. One option is to navigate to the sidebar on the left or the
												hamburger menu at the top of the site. Click on the "List" icon to go to your lists page. Here, click on "Create
												new Tier List" this will bring you to the Tier List creation page. The other option can be found in the Action
												Box on the right side of any game page. There is an option to "Add to list" that, when clicked, will give you an
												option to add to a new Tier List.
											</Typography>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												Once you've arrived at the Tier List creation page, you can search for games to add by using the "Search Games"
												bar. Games found here will be added to the bank. Games can be dragged from the bank to any other tier row. The
												title and color for the row can be changed by changed by clicking on the tier title box. A row can also be
												deleted when clicking on the tier title box. New tiers can be added by clicking the "Add new tier" box beneath
												the list. Once you've added a title and description to your list, it can be saved.
											</Typography>
											<img src={AddToList} alt={"AddToList"} width={"100%"} />
											<Box height={20} />
											<img src={CreateList} alt={"CreateList"} width={"100%"} />
										</Box>
									</Grid>
								</AccordionDetails>
							</Accordion>

							<Accordion sx={{ ml: 2, mr: 2, boxShadow: 10 }}>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
									aria-controls="panel1a-content"
									id="panel1a-header"
									sx={{ background: "#2a2a2a" }}>
									<ThemeProvider theme={theme}>
										<Typography fontSize={30} sx={{ mt: 2, color: "#FFF", borderRadius: 4 }}>
											How do I follow my friends?
										</Typography>
									</ThemeProvider>
								</AccordionSummary>
								<AccordionDetails sx={{ background: "#1E1E1E" }}>
									<Grid xs={12}>
										<Box sx={{ width: "92%", mb: 2 }}>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												To find someone else's profile on Leaderboard, go to the search bar located at the top in the navigation bar or
												the side bar. Type in their tag name and press enter. (Note: this is different from the display name. The tag
												name is preceded by an @ and can be viewed from your own profile page)
											</Typography>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												On the search results page, press the "Users" tab to bring up search results for the user tag you entered. When
												you find the desired profile, you can click the "Follow" button in their search result. You can also click their
												profile picture to visit their profile page and follow them from there.
											</Typography>
											<img src={SearchTerm} alt={"SearchTerm"} width={"100%"} />
											<Box height={20} />
											<img src={Follow} alt={"Follow"} width={"100%"} />
										</Box>
									</Grid>
								</AccordionDetails>
							</Accordion>

							<Accordion sx={{ ml: 2, mr: 2, boxShadow: 10 }}>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
									aria-controls="panel1a-content"
									id="panel1a-header"
									sx={{ background: "#2a2a2a" }}>
									<ThemeProvider theme={theme}>
										<Typography fontSize={30} sx={{ mt: 2, color: "#FFF", borderRadius: 4 }}>
											Where can I see reviews I've made?
										</Typography>
									</ThemeProvider>
								</AccordionSummary>
								<AccordionDetails sx={{ background: "#1E1E1E" }}>
									<Grid xs={12}>
										<Box sx={{ width: "92%", mb: 2 }}>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												To view all the games you have reviewed, simply click the "All Games" button located in the hamburger menu. You
												will be presented with a display of all the games you've written a review for and given simple star ratings. You
												can also see your reviews in your Recent Activity section at the bottom of your profile page. You can also click
												the "Games Reviewed" button found on your profile page.
											</Typography>
											<img src={AllGames} alt={"AllGames"} width={"100%"} />
										</Box>
									</Grid>
								</AccordionDetails>
							</Accordion>

							<Accordion sx={{ ml: 2, mr: 2, boxShadow: 10 }}>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
									aria-controls="panel1a-content"
									id="panel1a-header"
									sx={{ background: "#2a2a2a" }}>
									<ThemeProvider theme={theme}>
										<Typography fontSize={30} sx={{ mt: 2, color: "#FFF", borderRadius: 4 }}>
											Where can I see reviews my friends have made?
										</Typography>
									</ThemeProvider>
								</AccordionSummary>
								<AccordionDetails sx={{ background: "#1E1E1E" }}>
									<Grid xs={12}>
										<Box sx={{ width: "92%", mb: 2 }}>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												First, navigate to your friend's profile page. This can be done by searching for their profile in the search bar
												or, if you're already followed your friend, by clicking on the "Followers" button on the profile page and
												clicking their profile there. Once you've arrived at their profile, click the "Games Reviewed" button.
											</Typography>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												Additionally, whenever someone you follow reviews a game, their review will appear in the Recent Activity
												section on their profile page and on the Leaderboard home page. You will also receive a notification when
												someone you follow writes a review.
											</Typography>
											<img src={Following} alt={"Following"} width={"100%"} />
										</Box>
									</Grid>
								</AccordionDetails>
							</Accordion>

							<Accordion sx={{ ml: 2, mr: 2, boxShadow: 10 }}>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
									aria-controls="panel1a-content"
									id="panel1a-header"
									sx={{ background: "#2a2a2a" }}>
									<ThemeProvider theme={theme}>
										<Typography fontSize={30} sx={{ mt: 2, color: "#FFF", borderRadius: 4 }}>
											How do I use the backlog?
										</Typography>
									</ThemeProvider>
								</AccordionSummary>
								<AccordionDetails sx={{ background: "#1E1E1E" }}>
									<Grid xs={12}>
										<Box sx={{ width: "92%", mb: 2 }}>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												The backlog is a collection of games that allows users to save games they may want to play later. To add a game
												to your backlog, click the "Add to Backlog" button found in the bottom right of a game preview tile. You can
												also click the "Add to Backlog" button found in the Action Box found on any game page. You can remove a game
												from your backlog by pressing the "Remove from Backlog" button found in the same locations stated previously.
											</Typography>
											<Typography fontSize={18} sx={{ mt: 2, color: "#FFF" }} align="left">
												To view your backlog, you can click the "Backlog" button found in the sidebar or hamburger menu. In the backlog
												page, you can change the position of your saved games by dragging game tiles along the list. The three games at
												the top of this list will be displayed on your profile page.
											</Typography>
											<img src={Backlog1} alt={"Backlog1"} width={"100%"} />
											<Box height={20} />
											<img src={Backlog2} alt={"Backlog2"} width={"100%"} />
										</Box>
									</Grid>
								</AccordionDetails>
							</Accordion>

							<Grid item xs={12} align={"center"} sx={{ mx: 5, mt: 2, mb: 2, width: "auto" }}>
								<Box
									textAlign="center"
									sx={{
										width: 100,
										maxHeight: 55,
										bgcolor: "#4C2F97",
										borderRadius: 3
									}}>
									<Button
										onClick={() => {
											navigate(`/`)
										}}
										sx={{ textTransform: "none", color: "#FFF" }}>
										<Typography color="#FFF" align="center">
											RESPAWN
										</Typography>
									</Button>
								</Box>

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

export default FAQPage
