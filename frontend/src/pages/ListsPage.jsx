/*
The ListsPage. This page displays all of the lists this user has created
*/

import { useEffect, useState } from "react"
import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import Footer from "../components/FooterComponent"
import { Grid, Typography, ThemeProvider, createTheme, Button, Box, Card, CardContent } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { auth, db } from "../firebase.config"
import PreviewListComponent from "../components/PreviewListComponent"
import SpinnerComponent from "../components/SpinnerComponent"
import { SentimentVeryDissatisfied, AddBox } from "@mui/icons-material"

// Header font
const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans",
		fontSize: 20
	}
})

function ListsPage() {
	const { currentUser } = auth
	const userID = currentUser.uid

	const { username } = useParams()
	const [listIds, setListIds] = useState(null)
	const [lists, setLists] = useState([])
	const [listToShow, setListsToShow] = useState(true)

	const [showCreate, setShowCreate] = useState(false)

	const navigate = useNavigate()

	// use effect for getting the user from parameters
	useEffect(() => {
		getUserData()
	}, [username])

	// get reviews of user
	useEffect(() => {
		const getListData = async () => {
			let tempArr = []

			if (listIds.length !== 0) {
				setListsToShow(true)

				for (let i = 0; i < listIds.length; i++) {
					if (listIds[i].type === "list") {
						let listsDocRef = doc(db, "lists", listIds[i].list.toString())
						let listSnap = await getDoc(listsDocRef)

						let userInfoDocRef = null
						if (listSnap.data()) {
							userInfoDocRef = doc(db, "users", listSnap.data().userId)
							const userInfoSnap = await getDoc(userInfoDocRef)

							tempArr.push({
								id: listSnap.id,
								type: "list",
								createdAt: listSnap.data().createdAt,
								list: listSnap,
								profilePic: userInfoSnap.get("profilePic"),
								username: userInfoSnap.get("username"),
								name: userInfoSnap.get("name")
							})
						}
					} else {
						let tierlistsDocRef = doc(db, "tierlists", listIds[i].list.toString())
						let tierlistSnap = await getDoc(tierlistsDocRef)

						let userInfoDocRef = null
						if (tierlistSnap.data()) {
							userInfoDocRef = doc(db, "users", tierlistSnap.data().userId)
							const userInfoSnap = await getDoc(userInfoDocRef)

							tempArr.push({
								id: tierlistSnap.id,
								type: "tierlist",
								createdAt: tierlistSnap.data().createdAt,
								list: tierlistSnap,
								profilePic: userInfoSnap.get("profilePic"),
								username: userInfoSnap.get("username"),
								name: userInfoSnap.get("name")
							})
						}
					}
				}
			} else {
				setListsToShow(false)
			}

			tempArr.sort((a, b) => b.createdAt - a.createdAt)

			setLists(tempArr)
		}
		if (listIds) getListData()
	}, [listIds])

	// gets user from parameters
	async function getUserData() {
		setListIds(null)
		setLists([])
		setListsToShow(true)
		setShowCreate(null)

		const usersRef = collection(db, "users")
		const q = query(usersRef, where("username", "==", username))
		const docSnap = await getDocs(q)

		let tempArr = []
		docSnap.forEach((user) => {
			for (let i = 0; i < user.data().lists.length; i++) {
				tempArr.push({
					type: "list",
					list: user.data().lists[i]
				})
			}

			if (user.data().tierlists) {
				for (let i = 0; i < user.data().tierlists.length; i++) {
					tempArr.push({
						type: "tierlist",
						list: user.data().tierlists[i]
					})
				}
			}

			if (user.id === userID) setShowCreate(true)
			else setShowCreate(false)
		})

		setListIds(tempArr)
	}

	// JSX for showing all lists for a user. appends to a list in html format
	function ShowAllLists() {
		// if there are reviews to show, show a spinner until all games are populated
		if (listToShow) {
			// if there's any reviews to show
			if (lists.length !== 0) {
				const rows = []
				for (let i = 0; i < lists.length; i++) {
					if (lists[i].type === "tierlist") {
						rows.push(
							<PreviewListComponent
								key={i}
								type={"tierlist"}
								id={lists[i].id}
								upvotes={lists[i].list.data().upvotes}
								downvotes={lists[i].list.data().downvotes}
								title={lists[i].list.data().name}
								description={lists[i].list.data().listDescription}
								preview={getTierListPreview(lists[i].list)}
								userId={lists[i].list.data().userId}
								profilePic={lists[i].profilePic}
								username={lists[i].username}
								name={lists[i].name}
								reloadLists={getUserData}
								comments={lists[i].list.data().comments}
								createdAt={lists[i].list.data().createdAt}
							/>
						)
					} else {
						rows.push(
							<PreviewListComponent
								key={i}
								type={"list"}
								id={lists[i].id}
								upvotes={lists[i].list.data().upvotes}
								downvotes={lists[i].list.data().downvotes}
								title={lists[i].list.data().name}
								description={lists[i].list.data().listDescription}
								preview={getListPreview(lists[i].list)}
								userId={lists[i].list.data().userId}
								profilePic={lists[i].profilePic}
								username={lists[i].username}
								name={lists[i].name}
								reloadLists={getUserData}
								comments={lists[i].list.data().comments}
								createdAt={lists[i].list.data().createdAt}
							/>
						)
					}
				}
				return <>{rows.length !== 0 ? rows : <NoListsJSX />}</>
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
				<>
					<NoListsJSX />
				</>
			)
	}

	// returns a "no lists to display" component with frowny face :(
	const NoListsJSX = () => {
		return (
			<Card className="card" sx={{ bgcolor: "#252525", color: "#fff", width: "auto", borderRadius: 3, mb: 5, maxWidth: 800 }}>
				<CardContent>
					<SentimentVeryDissatisfied fontSize="large" />

					<ThemeProvider theme={theme}>
						<Typography>No Lists to Display</Typography>
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

		for (let k = 1; k < Object.keys(list.data().list).length; k++) {
			for (let j = 0; j < list.data().list[k].items.length; j++) {
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
			for (let k = 1; k < Object.keys(list.data().list).length; k++) {
				for (let j = 0; j < list.data().list[k].items.length; j++) {
					output.push(list.data().list[k].items[j].cover)
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
			for (let k = 1; k < Object.keys(list.data().list).length; k++) {
				for (let j = 0; j < list.data().list[k].items.length; j++) {
					output.push(list.data().list[k].items[j].cover)
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
				for (let j = 0; j < list.data().list[i].items.length; j++) {
					output.push(list.data().list[i].items[j].cover)
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

		for (let i = 0; i < list.data().list[0].items.length; i++) {
			output.push(list.data().list[0].items[i].cover)
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
		<>
			<div className="content-wrapper">
				<Navbar />
				<SideNav />

				<Grid container sx={{ width: "auto", mb: 3, mt: 3, ml: -0.75 }}>
					<Grid item xs={12} align={"center"}>
						<Card className="card" sx={{ bgcolor: "#252525", width: "auto", borderRadius: 3, mb: 5, maxWidth: 915 }}>
							<CardContent>
								<Grid container rowSpacing={1} columnSpacing={2} sx={{ width: "auto", mb: 3 }}>
									<Grid item xs={12}>
										<Grid className="box" borderRadius={3} container align={"center"} sx={{ mx: 3, width: "auto", maxWidth: 915 }}>
											<Grid item xs={12} sx={{ mx: 5, mt: 1, mb: 1, width: "auto" }}>
												<ThemeProvider theme={theme}>
													<Typography variant="h5" fontSize={"32px"} sx={{ flexGrow: 1 }}>
														Lists by @{username}
													</Typography>
												</ThemeProvider>
											</Grid>
										</Grid>
									</Grid>

									{showCreate ? (
										<>
											{/* next row, add list buttons*/}
											<Grid item xs={1} sm={2} md={3} align="center"></Grid>

											<Grid item xs={5} sm={4} md={3} align="center">
												<Box
													sx={{
														bgcolor: "#4C2F97",
														borderRadius: 3
													}}>
													<Button onClick={() => navigate(`/${username}/tierlist`)} sx={{ textTransform: "none", color: "#FFF" }}>
														<AddBox style={{ color: "FFFFFF" }} />
														<Typography sx={{ fontSize: { xs: "13px", sm: "15px" } }} color="#FFF">
															&nbsp;&nbsp;Create new Tier List
														</Typography>
													</Button>
												</Box>
											</Grid>

											<Grid item xs={5} sm={4} md={3} align="center">
												<Box
													sx={{
														bgcolor: "#4C2F97",
														borderRadius: 3
													}}>
													<Button onClick={() => navigate(`/${username}/list`)} sx={{ textTransform: "none", color: "#FFF" }}>
														<AddBox style={{ color: "FFFFFF" }} />
														<Typography sx={{ fontSize: { xs: "13px", sm: "15px" } }} color="#FFF">
															&nbsp;&nbsp;Create new List
														</Typography>
													</Button>
												</Box>
											</Grid>

											<Grid item xs={1} sm={2} md={3} align="center"></Grid>
										</>
									) : (
										""
									)}

									{/* next row, lists previews*/}
									<Grid item xs={12} align="center">
										<ShowAllLists />
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</div>
			<Footer />
		</>
	)
}

export default ListsPage
