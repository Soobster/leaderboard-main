/*
The ListSearchResultsComponent. When a user uses the search bar in the NavBar and selects the Lists tab,
any lists that match the search term will be displayed. The results are case sensitive.

The list covers preview is displayed, as well as the list title, description, and the creators profile
picture and name. 

Clicking the title or game covers will redirect that list, while click the profile pic or username will
link to that user's profile page

*/

import React, { useEffect, useState } from "react"
import { Avatar, Grid, Typography, createTheme, ThemeProvider } from "@mui/material"
import { Box, Card, CardContent } from "@mui/material"
import "../App.css"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../firebase.config"
import SpinnerComponent from "./SpinnerComponent"
import { collection, getDocs, query, where } from "firebase/firestore"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

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

function getPreviewCovers(props) {
	if (Object.keys(props.listData.list).length === 1) {
		return getListPreview(props.listData.list)
	} else return getTierListPreview(props.listData.list)
}

function ListSearchResultComponent(props) {
	const [listUsername, setListUsername] = useState(null)
	const [profilePic, setProfilePic] = useState(null)

	const navigate = useNavigate()

	useEffect(() => {
		const getListUserData = async () => {
			if (Object.keys(props.listData.list).length === 1) {
				const q = query(collection(db, "users"), where("lists", "array-contains", props.listData.id))
				const querySnapshot = await getDocs(q)
				querySnapshot.forEach((doc) => {
					setListUsername(doc.data().username)
					setProfilePic(doc.data().profilePic)
				})
			} else {
				const q = query(collection(db, "users"), where("tierlists", "array-contains", props.listData.id))
				const querySnapshot = await getDocs(q)
				querySnapshot.forEach((doc) => {
					setListUsername(doc.data().username)
					setProfilePic(doc.data().profilePic)
				})
			}
		}

		getListUserData()
	}, [])

	return (
		<>
			<Card
				className="card"
				sx={{
					boxShadow: "0px 0px 15px #0f0f0f",
					background: "linear-gradient(#2e2e2e, transparent)",
					color: "#fff",
					width: "auto",
					borderRadius: 3,
					mb: 4,
					mt: 1,
					maxWidth: 818
				}}>
				<CardContent>
					<Grid container rowSpacing={1}>
						{/* List Title */}
						<Grid item xs={12} align={"left"}>
							<ThemeProvider theme={theme}>
								<Typography
									fontSize={"32px"}
									sx={{
										"&:hover": {
											textDecoration: "underline",
											cursor: "pointer"
										}
									}}
									onClick={() => {
										Object.keys(props.listData.list).length !== 1
											? navigate(`/${listUsername}/tierlist/view/${props.listData.id}`)
											: navigate(`/${listUsername}/list/view/${props.listData.id}`)
									}}>
									{props.listData.name}
								</Typography>
							</ThemeProvider>
						</Grid>

						{/* List Covers */}
						<Grid item container xs={12} sm={4.5} justifyContent={"center"} minWidth={200}>
							<Grid item align={"center"}>
								<Box
									sx={{
										width: 200,
										borderRadius: 2,
										mr: 1,
										ml: -1,
										"&:hover": { cursor: "pointer", boxShadow: "0px 0px 15px #4C2F97" }
									}}
									onClick={() => {
										Object.keys(props.listData.list).length !== 1
											? navigate(`/${listUsername}/tierlist/view/${props.listData.id}`)
											: navigate(`/${listUsername}/list/view/${props.listData.id}`)
									}}>
									<Box
										component="img"
										width={90}
										sx={{
											backgroundColor: "#FFF",
											borderRadius: 2,
											boxShadow: "0px 0px 20px #000"
										}}
										src={getPreviewCovers(props)[2]}></Box>
									<Box
										component="img"
										width={90}
										sx={{
											backgroundColor: "#FFF",
											borderRadius: 2,
											boxShadow: "0px 0px 20px #000",
											ml: 1
										}}
										src={getPreviewCovers(props)[1]}></Box>
									<Box
										component="img"
										width={100}
										sx={{
											backgroundColor: "#FFF",
											borderRadius: 2,
											boxShadow: "0px 0px 20px #000",
											mt: -12
										}}
										src={getPreviewCovers(props)[0]}></Box>
								</Box>
							</Grid>
							<Grid mt={2} direction="row" spacing={1} xs={12} align={"left"} display={"inline-flex"}>
								{profilePic && (
									<Avatar
										alt="username"
										src={profilePic}
										sx={{
											height: 35,
											width: 35,
											mt: -0.75,
											"&:hover": { cursor: "pointer", boxShadow: "0px 0px 15px #4C2F97" }
										}}
										onClick={() => navigate(`/${listUsername}`)}
									/>
								)}

								<Typography sx={{ ml: 1 }} fontSize={"16px"} display={"inline-flex"}>
									{Object.keys(props.listData.list).length > 1 ? "Tier List by @" : "List by @"}
								</Typography>
								<Typography onClick={() => navigate(`/${listUsername}`)} className="username-hover">
									{listUsername}
								</Typography>
							</Grid>
						</Grid>
						{/* List Description */}
						<Grid
							item
							xs={12}
							sm={6.5}
							align={"left"}
							sx={{
								overflow: "hidden",
								textOverflow: "ellipsis",
								display: "-webkit-box",
								WebkitLineClamp: "9",
								WebkitBoxOrient: "vertical",
								flexGrow: 1,
								height: "auto",
								mb: 2
							}}>
							<Typography fontSize={"16px"}>{props.listData.listDescription}</Typography>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</>
	)
}

export default ListSearchResultComponent
