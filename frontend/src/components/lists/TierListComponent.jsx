/*
The Tier List Component. This component allows users to creat a tier list of any games they choose.

The user will be able to set the list title and the description in text fields at the top
of the page. They can use the search bar to find game to add to the "bank" of games below
and move game covers between differnt tiers. Each game cover has a trash icon in the bottom left they can
click to remove a game from their list. Users can click on the tier title boxes on the
left to rename, change color, or delete tiers entirely. The box at the very bottom allows users
to add new tiers to their list.
*/

import { createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, ThemeProvider, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore"
import { auth, db } from "../../firebase.config"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import SearchDropdrownComponent from "../SearchDropdrownComponent"
import DraggableListComponent from "../DraggableListComponent"
import Colorful from "@uiw/react-color-colorful"
import { ToastContainer } from "react-toastify"
import { successToast, errorToast } from "../../helperFunctions/toasts"
import { uuidv4 } from "@firebase/util"
import { useNavigate, useParams } from "react-router-dom"
import { checkGameCache } from "../../helperFunctions/checkGameCache"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function TierListComponent({ gameID, listID }) {
	const { currentUser } = auth
	const userID = currentUser.uid
	const userDocRef = doc(db, "users", userID)

	const { username } = useParams()

	const [listTitle, setListTitle] = useState("")
	const [listDescription, setListDescription] = useState("")
	// const [isPrivate, setIsPrivate] = useState(false)

	const [dialogText, setDialogText] = useState("")
	const [editDialogBool, setEditDialogBool] = useState(false)
	const [dialogIndex, setDialogIndex] = useState(0)
	const [dialogHex, setDialogHex] = useState("#4C2F97")

	const navigate = useNavigate()

	// states and handlers for ConfirmationDialog
	const [open, setOpen] = useState(false)

	const [rows, setRows] = useState({
		0: {
			name: "Bank",
			items: [],
			color: "#FFF"
		},
		1: {
			name: "S",
			items: [],
			color: "#cc2323"
		},
		2: {
			name: "A",
			items: [],
			color: "#264587"
		},
		3: {
			name: "B",
			items: [],
			color: "#278720"
		}
	})

	useEffect(() => {
		const fetchListInfo = async () => {
			const listRef = doc(db, "tierlists", `${listID}`)
			const listSnap = await getDoc(listRef)
			if (listSnap.exists()) {
				setRows(listSnap.data().list)
				setListTitle(listSnap.data().name)
				setListDescription(listSnap.data().listDescription)
			} else {
				//console.log("No such Tier List!")
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
			if (subscribed) {
				if (!fetchedData || !fetchedData[0] || !fetchedData[0].cover || !fetchedData[0].release_dates[0]) {
					errorToast("There was an error fetching specific game data. ")
				} else {
					setRows({
						...rows,
						0: {
							...rows[0],
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
	const handleAddGameToBank = (value) => {
		// value contains: label, id, name, year, cover, rating

		// individual game data to be stored
		let gameData = {
			gameID: value.id,
			title: value.name,
			cover: value.cover,
			year: value.year[0].y
		}

		let alreadyAdded = false
		for (const row in rows) {
			for (const item of rows[row].items) {
				if (item.gameID === value.id) {
					alreadyAdded = true
					break
				}
			}
		}
		if (!alreadyAdded) {
			let newItems = rows[0].items
			newItems.push(gameData)

			setRows({
				...rows,
				0: {
					...rows[0],
					items: newItems
				}
			})
		}
	}

	const handleRemoveGame = (gameID, rowID) => {
		const updatedItems = rows[rowID].items.filter((game) => game.gameID !== gameID)
		setRows({
			...rows,
			[rowID]: {
				...rows[rowID],
				items: updatedItems
			}
		})
	}

	// handler for dragging games. Moves games to different tiers or
	// moving around in the same tier
	const onDragEnd = (result) => {
		if (!result.destination) return

		const { source, destination } = result

		if (source.droppableId !== destination.droppableId) {
			const sourceRow = rows[source.droppableId]
			const destRow = rows[destination.droppableId]
			const sourceItems = [...sourceRow.items]
			const destItems = [...destRow.items]
			const [removed] = sourceItems.splice(source.index, 1)
			destItems.splice(destination.index, 0, removed)
			setRows({
				...rows,
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
			const row = rows[source.droppableId]
			const copiedItems = [...row.items]
			const [removed] = copiedItems.splice(source.index, 1)
			copiedItems.splice(destination.index, 0, removed)
			setRows({
				...rows,
				[source.droppableId]: {
					...row,
					items: copiedItems
				}
			})
		}
	}

	const addTier = () => {
		handleClose()
		let rowsLength = Object.keys(rows).length
		if (rowsLength <= 6) {
			setRows({
				...rows,
				[rowsLength]: {
					name: dialogText,
					items: [],
					color: dialogHex
				}
			})
		}
		setDialogText("")
	}

	const editTier = () => {
		const oldTier = rows[dialogIndex]
		setRows({
			...rows,
			[dialogIndex]: {
				...oldTier,
				name: dialogText,
				color: dialogHex
			}
		})
		handleClose()
	}

	const deleteTier = () => {
		if (Object.keys(rows).length <= 3) return
		const oldTier = rows[dialogIndex]
		for (const game of oldTier.items) {
			rows[0].items.push(game)
		}
		let newRows = {}

		for (const row in rows) {
			if (parseInt(row) !== dialogIndex) {
				newRows[row] = rows[row]
			}
		}
		let updatedRows = {}
		let updatedIdx = 0
		for (const [_, rowObject] of Object.entries(newRows)) {
			updatedRows[updatedIdx] = rowObject
			updatedIdx++
		}
		setRows(updatedRows)
		handleClose()
	}

	const handleClickOpen = () => {
		setOpen(true)
	}

	const handleClose = () => {
		setOpen(false)
		setEditDialogBool(false)
		setDialogText("")
		setDialogIndex(0)
	}

	const handleDialogTextChange = (e) => {
		const text = e.target.value
		const textLen = text.length
		if (textLen <= 25) {
			setDialogText(text)
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

	const handleTierClick = (index) => {
		handleClickOpen()
		setEditDialogBool(true)
		setDialogText(rows[index].name)
		setDialogIndex(index)
		setDialogHex(rows[index].color)
	}

	const handlePublishTierList = async () => {
		if (listTitle === "") {
			errorToast("Your Tier List needs a name!")
			return
		}

		let numItems = 0
		let enoughItems = false
		for (const row in rows) {
			if (rows[row]["name"] === "Bank") continue
			numItems += rows[row]["items"].length
			if (numItems > 0) {
				enoughItems = true
				break
			}
		}

		if (!enoughItems) {
			errorToast("You need at least 1 game in a tier list!")
			return
		}

		if (listID) {
			// edit current tier list
			rows[0] = {
				name: "Bank",
				items: [],
				color: "#FFF"
			}
			await updateDoc(doc(db, "tierlists", listID), {
				list: rows,
				name: listTitle,
				listDescription: listDescription
			})

			successToast("Your Tier List has been updated!", 3000)

			// redirect to view page of Tier List (not edit page or current page)
			navigate(`/${username}/tierlist/view/${listID}`)
		} else {
			// create new tier list
			const list_id = uuidv4()
			rows[0] = {
				name: "Bank",
				items: [],
				color: "#FFF"
			}
			await setDoc(doc(db, "tierlists", list_id), {
				userId: userID,
				list: rows,
				createdAt: serverTimestamp(),
				upvotes: [],
				downvotes: [],
				name: listTitle,
				listDescription: listDescription,
				comments: []
			})
			// add tierlist id to user's list of tierlists' ids
			const userRef = await doc(db, "users", userID)
			await updateDoc(userRef, {
				tierlists: arrayUnion(list_id)
			})

			// set notification to followers of current user about writing a Tier List
			const listUserSnap = await getDoc(userRef)
			const followers = listUserSnap.data().followers
			for (const followerId of followers) {
				const followerRef = await doc(db, "users", followerId)
				const notificationObj = {
					id: uuidv4(),
					createdAt: Timestamp.now(),
					senderId: userID,
					senderProfilePic: listUserSnap.get("profilePic"),
					text: `@${listUserSnap.get("username")} created a Tier List named "${listTitle}".`,
					data: {
						listOwnerUsername: listUserSnap.get("username"),
						listType: "tierlist",
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

			successToast("Your Tier List has been created!", 3000)

			// redirect to view page of Tier List (not edit page or current page)
			navigate(`/${username}/tierlist/view/${list_id}`)
		}
	}

	return (
		<>
			{/* add new tier dialog */}
			<Dialog
				open={open}
				PaperProps={{
					style: {
						backgroundColor: "transparent",
						boxShadow: "none"
					}
				}}>
				<DialogTitle sx={{ bgcolor: "#252525", color: "#FFF" }}>{editDialogBool ? "Update Tier" : "Add New Tier"}</DialogTitle>
				<DialogContent sx={{ bgcolor: "#252525" }}>
					<Typography color="#FFF">Tier Title (max: 25 characters):</Typography>
					<Box borderRadius={1} sx={{ mb: 5 }}>
						<TextField
							sx={{ width: { xs: 1, md: 300 }, backgroundColor: "#fff" }}
							value={dialogText}
							onChange={handleDialogTextChange}
							id="filled-basic"
						/>
					</Box>
					<Colorful
						color={dialogHex}
						onChange={(color) => {
							setDialogHex(color.hexa)
						}}
						disableAlpha
					/>
				</DialogContent>
				<DialogActions sx={{ bgcolor: "#252525" }}>
					{editDialogBool && Object.keys(rows).length > 3 && (
						<Button sx={{ backgroundColor: "red" }} variant="contained" onClick={deleteTier}>
							Delete
						</Button>
					)}
					<Button sx={{ color: "#FFF" }} onClick={handleClose}>
						Cancel
					</Button>

					<Button sx={{ color: "#FFF" }} onClick={editDialogBool ? editTier : addTier}>
						{editDialogBool ? "Edit Tier" : "Add Tier"}
					</Button>
				</DialogActions>
			</Dialog>

			<Grid container sx={{ width: "auto", mb: 3, mt: 3 }} align={"center"}>
				<Grid item xs={12}>
					<Grid container className="box" borderRadius={2} align="center" maxWidth={{ lg: 900, md: 700, sm: 800 }} rowSpacing={2}>
						<Grid item xs={12} align="left">
							<ThemeProvider theme={theme}>
								<Typography variant="h4" color="#fff" fontSize={"25px"} sx={{ flexGrow: 1, ml: 2 }}>
									Create Tier List
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
						{/* Submission Options */}
						<Grid item container direction="row" alignItems="flex-end" justifyContent="end" xs={12} sx={{ mr: 2 }}>
							<Button
								onClick={handlePublishTierList}
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
						<Grid item xs={12} align="left" sx={{ ml: 2, mr: 2 }}>
							<Typography color="#FFF">Search Games:</Typography>
							<SearchDropdrownComponent handleAddGameToBank={handleAddGameToBank} />
						</Grid>

						<Grid item xs={12} align="left">
							{/* Bank Header */}
							<ThemeProvider theme={theme}>
								<Typography variant="h5" color="#fff" fontSize={"25px"} sx={{ flexGrow: 1, ml: 2 }}>
									Bank
								</Typography>
							</ThemeProvider>
						</Grid>

						<Grid item xs={12} align="center">
							<Box>
								{/* Games to display in bank */}
								<DraggableListComponent rows={rows} onDragEnd={onDragEnd} handleTierClick={handleTierClick} removeGame={handleRemoveGame} />
							</Box>
						</Grid>
						<Grid item xs={12}>
							<Divider sx={{ borderBottomWidth: 2, mt: 1, mr: 1, ml: 1, mb: 1, bgcolor: "#a3a3a3" }} />
						</Grid>

						{/* Add new tier square */}
						<Grid container item xs={12}>
							{Object.keys(rows).length !== 7 ? (
								<Grid item align={"left"} sx={{ width: "auto" }}>
									<ThemeProvider theme={theme}>
										<Typography variant="h5" color="#fff" ml={2.5} fontSize={"25px"} sx={{ flexGrow: 1 }}>
											Add new tier
										</Typography>
									</ThemeProvider>
									<Grid item xs={1} ml={2} mb={-2}>
										<Box
											container="true"
											sx={{
												display: "inline-flex",
												alignItems: "center",
												justifyContent: "center",
												width: 120,
												height: 120,
												fontSize: "32px",
												backgroundColor: "#a3a3a3",
												"&:hover": {
													backgroundColor: "#888888",
													opacity: [0.9, 0.8, 0.7],
													cursor: "pointer"
												}
											}}
											onClick={() => handleClickOpen()}>
											+
										</Box>
									</Grid>
								</Grid>
							) : (
								""
							)}
						</Grid>
						{/* Submission Options */}
						<Grid item container direction="row" alignItems="flex-end" justifyContent="end" xs={12} sx={{ mr: 2, mb: 2 }}>
							<Button
								onClick={handlePublishTierList}
								sx={{ textTransform: "none", color: "#FFFFFF", borderRadius: 2, background: "linear-gradient(#4f319b,#362269)" }}>
								<Typography color="#FFFFFF" align="center">
									{!listID ? "Save and Publish" : "Update and Publish"}
								</Typography>
							</Button>
						</Grid>
					</Grid>
				</Grid>

				{/* Column 5: Tier Rows */}
				{/* Column 6: Add New Row */}
			</Grid>
			<ToastContainer />
		</>
	)
}

export default TierListComponent
