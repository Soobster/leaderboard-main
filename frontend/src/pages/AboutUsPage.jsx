/*
The About Us Page. This shows a discription of Leaderboard and our goals. 
It also displays bios, headshots, and contact information of all the team members
that anyone can view.

This page is loaded when the "Team" link in the footer is clicked.
*/
import Navbar from "../components/NavbarComponent"
import Footer from "../components/FooterComponent"
import { Grid, Typography, ThemeProvider, createTheme, Button, Box } from "@mui/material"
import { useNavigate } from "react-router-dom"
import TeamPhoto from "../assets/team_photo.png"
import SideNav from "../components/SideNavComponent"

import Amanda from "../assets/Headshots/Amanda.png"
import Panic from "../assets/Headshots/Panic.jpg"
import Sooby_Mugshot from "../assets/Headshots/Sooby_Mugshot.jpg"
import Yo_1 from "../assets/Headshots/Yo_1.jpeg"
import { Text, View, Image } from "react"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans",
		fontSize: 20
	}
})

function AboutUsPage() {
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
											We are Leaderboard
										</Typography>
									</ThemeProvider>
								</Box>

								<img src={TeamPhoto} alt="team_photo" style={{ width: "75%" }} />
								<Typography fontSize={14}>Team members: Subhan "Sooby" Mahmood, Jose Matute, Amanda Shepherd, Hyrum Schenk</Typography>
							</Grid>

							<Grid xs={12}>
								<Box borderBottom={1} sx={{ width: "85%", mb: 2 }}>
									<ThemeProvider theme={theme}>
										<Typography variant="h5" sx={{ mt: 2 }}>
											About Us
										</Typography>
									</ThemeProvider>
								</Box>
							</Grid>

							<Grid xs={12}>
								<Box sx={{ width: "85%", mb: 2 }}>
									<Typography variant="h6" sx={{ mt: 2 }} align="left">
										We are a team of four undergraduate software engineers attending the University of Utah. Our team has designed and
										developed this site from the ground up for our senior capstone project. We are driven and passionate about creating a
										feature-rich and user friendly site that will achieve not only our goal to create a polished final product, but also
										fulfill the desires of our end users.
									</Typography>
								</Box>
							</Grid>

							<Grid xs={12}>
								<Box borderBottom={1} sx={{ width: "85%", mb: 2 }}>
									<ThemeProvider theme={theme}>
										<Typography variant="h5" sx={{ mt: 2 }}>
											Goals
										</Typography>
									</ThemeProvider>
								</Box>
							</Grid>

							<Grid xs={12}>
								<Box sx={{ width: "85%", mb: 2 }}>
									<Typography variant="h6" sx={{ mt: 2 }} align="left">
										Leaderboard is a videogame critique and cataloging site targeted at everyday gamers. People who come to our site can
										search for any game from any platform and express their thoughts of games they've played for others to see. If they find
										a game they're interested in, they'll be able to save those games in their backlog to return to later. Users will also
										be able to save collections of games in lists or in ranked tier-lists.
									</Typography>
									<Typography variant="h6" sx={{ mt: 2 }} align="left">
										We also know that for many people, gaming is a social experience. This is why we have implemented a followers feature to
										allow users to stay caught up with friends or content creators on they games they've played. Whenever someone follow
										writes a review, people that follow them will receive a notification on the game they've played.
									</Typography>
									<Typography variant="h6" sx={{ mt: 2 }} align="left">
										We hope that this site sparks discussion among players and helps them organize and express their thoughts about the
										games they're interested in.
									</Typography>
								</Box>
							</Grid>

							<Grid xs={12}>
								<Box borderBottom={1} sx={{ width: "85%", mb: 2 }}>
									<ThemeProvider theme={theme}>
										<Typography variant="h5" sx={{ mt: 2 }}>
											Individual Bios
										</Typography>
									</ThemeProvider>
								</Box>
							</Grid>

							<Grid xs={12}>
								<Box borderBottom={1} sx={{ width: "85%", mb: 2, flex: 1, flexDirection: "row" }}>
									<Typography style={{ flex: 1 }}>
										<img src={Amanda} alt="team_photo" style={{ width: "150px" }} />
										<Typography variant="h6" align="center" mt={1} fontSize={18}>
											Contact: amandamshep@gmail.com
										</Typography>
										<Typography variant="h6" sx={{ mt: 1 }} align="left">
											Amanda Shepherd is graduating in computer science with a passion for using technology to solve social problems and a
											strong commitment to promoting diversity in the tech industry.
										</Typography>
										<Typography variant="h6" sx={{ mt: 2 }} align="left">
											During college, she was able to gain practical experience through multiple internships in the tech industry, which
											helped her develop a deeper understanding of software development and project management. These experiences allowed
											her to gain a wealth of knowledge in full-stack web development. Aside from her technical skills, she was also a
											member of her university's debate team. This experience helped her develop strong communication and analytical
											skills and an ability to articulate her thoughts in a clear and engaging manner.
										</Typography>
										<Typography variant="h6" sx={{ mt: 2 }} align="left">
											In addition to her technical skills, she is also passionate about making the tech industry more diverse and
											inclusive. She believes that the tech industry can play a vital role in addressing social issues, and she is
											committed to using her skills to make a positive impact. As a computer science graduate, Amanda has studied the
											ethics of data science and computing, including topics such as privacy, bias, and fairness. She believes in using
											technology in a way that respects the rights and dignity of all people and is committed to incorporating ethical
											considerations into her work in data science and computing to help create a more just and equitable world.
										</Typography>
										<Typography variant="h6" sx={{ mt: 2 }} align="left">
											With her strong technical skills, communication abilities, and passion for social impact, she is poised to make a
											meaningful contribution to the tech industry and to society as a whole.
										</Typography>
									</Typography>
								</Box>
							</Grid>

							<Grid xs={12}>
								<Box borderBottom={1} sx={{ width: "85%", mb: 2, flex: 1, flexDirection: "row" }}>
									<Typography style={{ flex: 1 }}>
										<img src={Sooby_Mugshot} alt="team_photo" style={{ width: "150px" }} />
										<Typography variant="h6" align="center" mt={1} fontSize={18}>
											Contact: subhanamir7@gmail.com.
										</Typography>
										<Typography variant="h6" sx={{ mt: 1 }} align="left">
											Subhan Mahmood is graduating with a Computer Science degree from the University of Utah. He is interested in
											creating projects that challenge him creatively that have a big (or small!) impact to the world.
										</Typography>
										<Typography variant="h6" sx={{ mt: 2 }} align="left">
											During his time at the U, he gained lots of experience creating interesting software and working with multiple
											different teams. Many of these were full-stack projects that were received quite well from course staff. These
											included anything from a Health and Lifestyle Mobile App to a TankWars game with multiple concurrent players.
											Additionally, of couse, Leaderboard is included too! Regarding teamwork, if just a few things could be taken from
											his time working with these teams, it would be that he is an effective communicator, has great technical skills, and
											is reliable.
										</Typography>
										<Typography variant="h6" sx={{ mt: 2 }} align="left">
											Beyond technical skills, he also has a passion for art and anything creative. Whether it be basic drawing or
											designing a UI for a website, he always gives it his all to create something that not only looks pleasing, but has
											the easy-to-use and easy-to-understand form to back it up.
										</Typography>
									</Typography>
								</Box>
							</Grid>

							<Grid xs={12}>
								<Box borderBottom={1} sx={{ width: "85%", mb: 2, flex: 1, flexDirection: "row" }}>
									<Typography style={{ flex: 1 }}>
										<img src={Yo_1} alt="team_photo" style={{ width: "150px" }} />
										<Typography variant="h6" align="center" mt={1} fontSize={18}>
											Contact: jemg1210@gmail.com
										</Typography>
										<Typography variant="h6" sx={{ mt: 1 }} align="left">
											Jose Matute is a student graduating from the University of Utah in May of 2023 with a Bachelor's in Computer
											Science. He came to the United States in 2016 from Honduras and pursued Computer Science because of the different
											amount of ways problems can be solved using the tools taught in this degree.
										</Typography>
										<Typography variant="h6" sx={{ mt: 2 }} align="left">
											Jose has worked on many different projects throughout his career and has experience in many platforms like web,
											desktop, and mobile apps, including Leaderboard. He is very interested in solving problems with teams that are
											collaborative and hardworking. He enjoys this process because it helps him stay motivated, engaged, and productive.
										</Typography>
										<Typography variant="h6" sx={{ mt: 2 }} align="left">
											In addition, he likes to read and listen to books, travel, and work on personal projects in his free time.
										</Typography>
									</Typography>
								</Box>
							</Grid>

							<Grid xs={12}>
								<Box borderBottom={1} sx={{ width: "85%", mb: 2, flex: 1, flexDirection: "row" }}>
									<Typography style={{ flex: 1 }}>
										<img src={Panic} alt="team_photo" style={{ width: "150px" }} />
										<Typography variant="h6" align="center" mt={1} fontSize={18}>
											Contact: hyrum.schenk@gmail.com
										</Typography>
										<Typography variant="h6" sx={{ mt: 1 }} align="left">
											Hyrum Schenk is a University of Utah student and soon to be graduate with a B.S. in computer science. He has a
											strong passion for software development and utilizing it to improve the lives of others.
										</Typography>
										<Typography variant="h6" sx={{ mt: 2 }} align="left">
											During his years at college, he's had the opportunity to engage with a variety of projects spanning different fields
											in computer science. This has allowed him to become familiar with a breadth of topics and strengthened his overall
											understanding of interacting technologies. A few of these projects include an Agario-style game, building an SQL
											database for college students and faculty, a decentralized file sharing network and this site, Leaderboard. While
											working on these projects, he has also developed strong teamwork skills in both remote and in-person environments.
										</Typography>
										<Typography variant="h6" sx={{ mt: 2 }} align="left">
											In his spare time, Hyrum likes playing video games, learning Japanese and working on his own software projects. He
											has been married to his husband for a year and a half and has a pet cat named Navi. While he currently lives in
											Utah, he is looking to move out of state for his career if the opportunity presents itself.
										</Typography>
									</Typography>
								</Box>
							</Grid>

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

export default AboutUsPage
