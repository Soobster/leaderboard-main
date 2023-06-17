/*
The Authentication page. This displays when the user has not made an account yet. The page is divided into two sections.
The left is an image with the logo along with base-level information about the site. It's like an advertisement.

The right contains the actual sign-in options for the user. They can use Google to create an account.
Clicking on one of them will lead to their respective authentication pages. Afterward, it will redirect back to 
Leaderboard.
*/

import { Box, Button, Container, createTheme, Grid, ThemeProvider, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserAuth } from "../context/AuthContext"
import { auth, db } from "../firebase.config"
import { collection, getDocs, query, where } from "firebase/firestore"
import Spinner from "../components/Spinner"
import GoogleIcon from "@mui/icons-material/Google"
import LockIcon from "@mui/icons-material/Lock"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

// Creates the copyright © on the bottom of the page
function Copyright(props) {
	return (
		<Typography variant="body2" color="text.secondary" align="center" {...props}>
			{"Copyright © "}
			<Link style={{ color: "#715AAC" }} href="https://mui.com/">
				Leaderboard
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	)
}

function AuthenticationPage() {
	const [loading, setLoading] = useState(true)
	const left_box_color = "#4C2F97"
	const { googleSignIn } = UserAuth()
	const { currentUser } = auth
	const navigate = useNavigate()

	const handleSignIn = async () => {
		setLoading(true)
		try {
			await googleSignIn()
		} catch (error) {
			console.log(error)
		}
	}

	// redirect to the homepage if a user is already logged in
	useEffect(() => {
		const queryEmail = async () => {
			const usersRef = collection(db, "users")
			const q = query(usersRef, where("email", "==", currentUser.email))
			const querySnapshot = await getDocs(q)
			if (!querySnapshot.size) {
				// new user
				navigate("/create")
			} else navigate("/")
		}

		if (currentUser) {
			setLoading(true)
			queryEmail()
		} else setLoading(false)
	}, [currentUser])

	return loading ? (
		<Spinner />
	) : (
		<>
			<Grid container sx={{ height: "100vh" }} direction="row" justifyContent="center" alignItems="center">
				<Grid
					item
					sm={4}
					md={7}
					sx={{ bgcolor: left_box_color, display: { xs: "none", md: "flex" }, height: "100vh" }}
					display="flex"
					direction="column"
					justifyContent="center"
					alignContent="center">
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							fontSize: 64
						}}>
						<img src={require("../assets/Leaderboard_Logos/logo_black_purple_transparent.png")} width={350} alt={"Leaderboard logo"}></img>

						<ThemeProvider theme={theme}>
							<Typography fontSize={60} align="center">
								Join the discussion!
							</Typography>
						</ThemeProvider>
					</Box>
				</Grid>
				<Grid item xs={12} sm={8} md={5} elevation={6} alignContent="center" justifyContent="center" display="flex">
					<Container component="main">
						{/* Sign in icon with centering */}
						<Box
							sx={{
								marginTop: 30,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								mt: -1
							}}>
							{/* only appears when there's not enough space for the purple side */}
							<Box
								component="img"
								width={100}
								height={100}
								src={require("../assets/Leaderboard_Logos/logo_black_purple_transparent.png")}
								sx={{
									mb: 5,
									display: { xs: "block", sm: "block", md: "none" }
								}}
							/>
							<LockIcon style={{ fontSize: 60, color: "white" }} />

							{/* Sign in text */}
							<Typography component="h1" variant="h5" mt={1} sx={{ color: "#FFF" }}>
								Sign in with:
							</Typography>

							{/* Box with various log in icons and the "remember me" */}
							<Box component="form" noValidate sx={{ mt: 1 }}>
								<Button onClick={handleSignIn}>
									<GoogleIcon alt="google" sx={{ width: 50, height: 50, color: "#FFF" }} />
								</Button>
							</Box>
						</Box>
						{/* Copyright footer */}
						<Copyright sx={{ mt: 5, mb: 4, color: "#FFF" }} />
					</Container>
				</Grid>
			</Grid>
		</>
	)
}

export default AuthenticationPage
