/*
The List Component. This component allows users to creat a list of any games they choose.

The user will be able to set the list title and the description in text fields at the top
of the page. They can use the search bar to find game to add to the "bank" of games below
and move game covers around. Each game cover has a trash icon in the bottom left they can
click to remove a game from their list.
*/
import { Box, Button, createTheme, Divider, Grid, TextField, ThemeProvider, Typography } from "@mui/material"
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { auth, db } from "../../firebase.config"
import { errorToast, successToast } from "../../helperFunctions/toasts"
import { uuidv4 } from "@firebase/util"
import SearchDropdrownComponent from "../SearchDropdrownComponent"
import DraggableListComponent from "../DraggableListComponent"
import { ToastContainer } from "react-toastify"
import { checkGameCache } from "../../helperFunctions/checkGameCache"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function ListComponent({ gameID, listID }) {
	const { currentUser } = auth
	const userID = currentUser.uid
	const userDocRef = doc(db, "users", userID)
	const { username } = useParams()

	const [listTitle, setListTitle] = useState("")
	const [listDescription, setListDescription] = useState("")
	const navigate = useNavigate()
	const [list, setList] = useState({
		0: {
			items: []
		}
	})

	useEffect(() => {
		const fetchListInfo = async () => {
			const listRef = doc(db, "lists", `${listID}`)
			const listSnap = await getDoc(listRef)
			if (listSnap.exists()) {
				setList(listSnap.data().list)
				setListTitle(listSnap.data().name)
				setListDescription(listSnap.data().listDescription)
			} else {
				console.log("No such List!")
				navigate("/notfound")
			}
		}
		if (listID) fetchListInfo()
	}, [listID])

	// use effect for grabbing game data
	useEffect(() => {
		let subscribed = true
		const fetchGameData = async () => {
			const fetchedData = await checkGameCache([gameID])
			console.log(fetchedData)
			if (subscribed) {
				if (!fetchedData || !fetchedData[0] || !fetchedData[0].cover || !fetchedData[0].release_dates[0]) {
					errorToast("There was an error fetching specific game data. ")
				} else {
					setList({
						0: {
							items: [
								{
									cover: fetchedData[0].cover.url.replace("t_thumb", "t_1080p"),
									gameID: parseInt(gameID),
									title: fetchedData[0].name,
									year: fetchedData[0].release_dates[0].y
								}
							]
						}
					})
				}
			}
		}

		if (gameID) fetchGameData()

		return () => {
			subscribed = false
		}
	}, [gameID])

	// when a user searches for a game, add its data (value) to the bank
	const handleAddGameToList = (value) => {
		// value contains: label, id, name, year, cover, rating

		// individual game data to be stored
		let gameData = {
			gameID: value.id,
			title: value.name,
			cover: value.cover,
			year: value.year[0].y
		}

		let alreadyAdded = false
		for (const row in list) {
			for (const item of list[row].items) {
				if (item.gameID === value.id) {
					alreadyAdded = true
					break
				}
			}
		}
		if (!alreadyAdded) {
			let newItems = list[0].items
			newItems.push(gameData)

			setList({
				0: {
					items: newItems
				}
			})
		}
	}

	const handleRemoveGame = (gameID) => {
		const updatedItems = list[0].items.filter((game) => game.gameID !== gameID)
		setList({
			0: {
				items: updatedItems
			}
		})
	}

	// handler for dragging games in the list
	const onDragEnd = (result) => {
		if (!result.destination) return

		const { source, destination } = result

		if (source.droppableId !== destination.droppableId) {
			const sourceRow = list[source.droppableId]
			const destRow = list[destination.droppableId]
			const sourceItems = [...sourceRow.items]
			const destItems = [...destRow.items]
			const [removed] = sourceItems.splice(source.index, 1)
			destItems.splice(destination.index, 0, removed)
			setList({
				[source.droppableId]: {
					...sourceRow,
					items: sourceItems
				},
				[destination.droppableId]: {
					...destRow,
					items: destItems
				}
			})
		} else {
			const row0 = list[source.droppableId]
			const copiedItems = [...row0.items]
			const [removed] = copiedItems.splice(source.index, 1)
			copiedItems.splice(destination.index, 0, removed)
			setList({
				[source.droppableId]: {
					items: copiedItems
				}
			})
		}
	}

	const handleListTitleChange = (e) => {
		const text = e.target.value
		setListTitle(text)
	}

	const handleListDescriptionChange = (e) => {
		const text = e.target.value
		setListDescription(text)
	}

	const handlePublishList = async () => {
		if (listTitle === "") {
			errorToast("Your List needs a name!")
			return
		}

		let numItems = 0
		let enoughItems = false
		numItems += list[0]["items"].length
		if (numItems > 0) {
			enoughItems = true
		}

		if (!enoughItems) {
			errorToast("You need at least 1 game in a list!")
			return
		}

		if (listID) {
			// edit current list
			await updateDoc(doc(db, "lists", listID), {
				list: list,
				name: listTitle,
				listDescription: listDescription
			})

			successToast("Your List has been updated!", 3000)
			// redirect to view page of List (not edit page or current page)
			navigate(`/${username}/list/view/${listID}`)
		} else {
			// create new list
			const list_id = uuidv4()
			await setDoc(doc(db, "lists", list_id), {
				userId: userID,
				list: list,
				createdAt: serverTimestamp(),
				upvotes: [],
				downvotes: [],
				name: listTitle,
				listDescription: listDescription,
				comments: []
			})
			// add list id to user's array of lists' ids
			const userRef = await doc(db, "users", userID)
			await updateDoc(userRef, {
				lists: arrayUnion(list_id)
			})

			// set notification to followers of current user about writing a List
			const listUserSnap = await getDoc(userRef)
			const followers = listUserSnap.data().followers
			for (const followerId of followers) {
				const followerRef = await doc(db, "users", followerId)
				const notificationObj = {
					id: uuidv4(),
					createdAt: Timestamp.now(),
					senderId: userID,
					senderProfilePic: listUserSnap.get("profilePic"),
					text: `@${listUserSnap.get("username")} created a List named "${listTitle}".`,
					data: {
						listOwnerUsername: listUserSnap.get("username"),
						listType: "list",
						listID: list_id,
						username: listUserSnap.get("username")
					},
					seen: false,
					scenario: 3
				}
				updateDoc(followerRef, {
					"notifications": arrayUnion(notificationObj)
				})
			}

			successToast("Your List has been created!", 3000)

			// redirect to view page of List (not edit page or current page)
			navigate(`/${username}/list/view/${list_id}`)
		}
	}

	return (
		<>
			<Grid container align={"center"}>
				<Grid item xs={12}>
					<Grid
						container
						borderRadius={2}
						className="box"
						sx={{ width: "auto", mb: 3, mt: 1 }}
						align={"center"}
						maxWidth={{ lg: 900, md: 700, sm: 800 }}
						rowSpacing={2}>
						{/* List Title Header */}
						<Grid item xs={12} align="left">
							<ThemeProvider theme={theme}>
								<Typography variant="h4" color="#fff" fontSize={"25px"} sx={{ flexGrow: 1, ml: 2 }}>
									Create List
								</Typography>
							</ThemeProvider>
						</Grid>

						{/* Column 1: List Title and Private list check fields */}
						<Grid item md={5} sm={11} xs={11}>
							<Box bgcolor="#ffffff" borderRadius={1} sx={{ width: { xs: 1, md: 250, lg: 300 }, ml: 2 }}>
								<TextField
									sx={{ width: { xs: 1, md: 250, lg: 300 } }}
									value={listTitle}
									id="filled-basic"
									label="List Title"
									variant="filled"
									onChange={handleListTitleChange}
								/>
							</Box>
						</Grid>

						{/* Column 2: List description field */}
						<Grid item md={7} sm={11} xs={11}>
							<Box bgcolor="#ffffff" borderRadius={1} sx={{ width: { xs: 1, md: 250, lg: 350 }, ml: 2 }}>
								<TextField
									sx={{ width: { xs: 1, md: 250, lg: 350 } }}
									id="filled-basic"
									label="List Description"
									variant="filled"
									value={listDescription}
									multiline
									rows={3}
									onChange={handleListDescriptionChange}
								/>
							</Box>
						</Grid>

						{/* Column 4: Submission Options */}
						{/* Submission Options */}
						<Grid item container direction="row" alignItems="flex-end" justifyContent="end" xs={12} sx={{ mr: 2 }}>
							<Button
								onClick={handlePublishList}
								sx={{ textTransform: "none", color: "#FFFFFF", borderRadius: 2, background: "linear-gradient(#4f319b,#362269)" }}>
								<Typography color="#FFFFFF" align="center">
									{!listID ? "Save and Publish" : "Update and Publish"}
								</Typography>
							</Button>
						</Grid>
						<Grid item xs={12}>
							<Divider sx={{ borderBottomWidth: 2, mt: 1, mr: 1, ml: 1, mb: 1, bgcolor: "#a3a3a3" }} />
						</Grid>

						{/* Column 3: Search games */}
						{/* Column 3: Search games */}
						<Grid item xs={12} align="left" sx={{ ml: 2, mr: 2 }}>
							<Typography color="#FFF">Search Games:</Typography>
							<SearchDropdrownComponent handleAddGameToBank={handleAddGameToList} />
						</Grid>

						<Grid item xs={12} align="center">
							<Box>
								{/* Games to display in bank */}
								<DraggableListComponent rows={list} onDragEnd={onDragEnd} removeGame={handleRemoveGame} isRegularList={true} />
							</Box>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
			<ToastContainer />
		</>
	)
}

export default ListComponent
