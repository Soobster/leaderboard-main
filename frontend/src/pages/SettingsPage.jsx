/*
The SettingsPage. The user can edit various settings related to their account.

They can update:
Their profile name
Their bio
their favorite game
their profile picture
*/

import { ThemeProvider } from "@emotion/react"
import { ArrowBack, ClearRounded } from "@mui/icons-material"
import {
	Avatar,
	Box,
	Button,
	createTheme,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	TextField,
	Tooltip,
	Typography
} from "@mui/material"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import Footer from "../components/FooterComponent"
import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import { auth, db } from "../firebase.config"
import { uuidv4 } from "@firebase/util"
import SearchDropdrownComponent from "../components/SearchDropdrownComponent"
import { getFunctions, httpsCallable } from "firebase/functions"
import { signOut } from "firebase/auth"

// header font
const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function SettingsPage() {
	const [profileName, setProfileName] = useState({
		value: "",
		text: "",
		error: false
	})
	const [favGame, setFavGame] = useState({
		value: null,
		text: "",
		error: false
	})
	const [defaultFavGame, setDefaultFavGame] = useState(null)
	const [bio, setBio] = useState({
		value: "",
		text: "Count: 0/500",
		error: false
	})
	const [username, setUsername] = useState("")
	const [photo, setPhoto] = useState({
		file: null,
		url: "",
		loading: false,
		error: false
	})
	const [photoValue, setPhotoValue] = useState(null)
	const [userPhoto, setUserPhoto] = useState(null)
	const [loadingDelete, setLoadingDelete] = useState(false)
	const { currentUser } = auth
	const userRef = doc(db, "users", currentUser.uid)
	const navigate = useNavigate()
	const storage = getStorage()
	const functions = getFunctions()
	const deleteAccount = httpsCallable(functions, "deleteAccount")

	// state and open and close handlers for Confirm Delete Account
	const [openConfirmDeleteAccount, setOpenConfirmDeleteAccount] = useState(false)

	const handleClickOpenConfirmDeleteAccount = () => {
		setOpenConfirmDeleteAccount(true)
	}

	const handleCloseConfirmDeleteAccount = () => {
		setOpenConfirmDeleteAccount(false)
	}

	// use effect for getting the user's current data
	useEffect(() => {
		const queryUserData = async () => {
			const docSnap = await getDoc(userRef)
			setProfileName({ ...profileName, value: docSnap.get("name") })
			setFavGame({ ...favGame, value: docSnap.get("favGame") })
			setDefaultFavGame(docSnap.get("favGame"))
			setBio({
				...bio,
				value: docSnap.get("bio"),
				text: `${docSnap.get("bio").length}/500`
			})
			setUsername(docSnap.get("username"))
			setUserPhoto(docSnap.get("profilePic"))
		}
		queryUserData()
	}, [currentUser])


	// handler for updating the profile name
	const handleProfileNameChange = (e) => {
		setProfileName({ ...profileName, value: e.target.value })
	}

	// handler for updating the bio
	const handleBioChange = (e) => {
		const bioText = e.target.value
		const length = bioText.length
		if (length <= 500) {
			setBio({ ...bio, value: bioText, text: `Count: ${length}/500` })
		}
	}

	// handler for updating the favorite game
	const handleFavGameChange = (value) => {
		setFavGame({ ...favGame, value: value })
	}

	// START: functions related to uploading a picture = = = = = = =

	// handler for uploading a picture
	const handlePictureUploadChange = (e) => {
		if (e.target.files[0]) {
			setPhoto({ ...photo, file: e.target.files[0] })
			const reader = new FileReader()
			reader.onload = () => {
				if (reader.readyState === 2) {
					setPhotoValue(reader.result)
				}
			}
			reader.readAsDataURL(e.target.files[0])
		}
	}

	// uploads a picutre to the db
	const uploadProfilePic = async (file) => {
		// creates placeholder that will go in Firebase Storage
		const storageRef = ref(storage, "images/" + `${currentUser.uid}-${uuidv4()}`)
		setPhoto({ ...photo, loading: true })
		const metadata = {
			contentType: "image/jpeg"
		}
		// uploads the picture to Storage
		await uploadBytes(storageRef, file, metadata)
		if (userPhoto !== "") deleteOldProfilePic()
		return await getDownloadURL(storageRef)
	}

	// checks whether a field is empty when trying to submit
	const isFieldEmpty = (fieldName, field, setField) => {
		const fieldEmpty = field.value === ""
		if (fieldEmpty) {
			setField({
				...field,
				error: true,
				text: `${fieldName} field cannot be empty.`
			})
			errorToast(`${fieldName} field cannot be empty.`, 3000)
		}
		return fieldEmpty
	}

	// checks whether the favorite game field is empty
	const isFavGameEmpty = () => {
		const fieldEmpty = favGame.value === null || favGame.value === ""
		if (fieldEmpty) {
			errorToast(`Favorite game field cannot be empty.`, 3000)
		}
		return fieldEmpty
	}

	// deletes old profile pic from the db after the user updates their pfp
	const deleteOldProfilePic = async () => {
		// example of userId: https://firebasestorage.googleapis.com/v0/b/leaderboard-758d3.appspot.com/o/images%2FGe8pHzxHJyZCm4finOypm8yEpWn1-b0b0a1de-186c-462c-beea-075dde210c29?alt=media&token=e4b0d381-61ff-4032-a9c2-53169decd88c
		const imageIdStartIdx = userPhoto.search("images%2F") + 9 // after this idx its the entire image id
		const imageIdEndIdx = userPhoto.search("alt") - 1 // up to this idx is the id of the image
		const imageId = userPhoto.substring(imageIdStartIdx, imageIdEndIdx)
		// Create a reference to the file to delete
		const oldProfilePicRef = ref(storage, `images/${imageId}`)
		// Delete the file
		await deleteObject(oldProfilePicRef)
			.then(() => {
				console.log("[Settings]: File deleted successfully")
			})
			.catch((error) => {
				console.log("Settings]: Error occured in deleteOldProfilePic")
			})
	}

	// shows an error toast in the corner
	const errorToast = (text, time) => {
		return toast.error(text, {
			position: "bottom-right",
			autoClose: time,
			hideProgressBar: false,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: "light"
		})
	}

	// shows a success toast in the corner
	const successToast = (text, time) => {
		return toast.success(text, {
			position: "bottom-right",
			autoClose: time,
			hideProgressBar: false,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: "light"
		})
	}

	// resets any error that exist in the text entries
	const resetTextErrors = () => {
		setProfileName({ ...profileName, error: false, text: "" })
		setBio({ ...bio, error: false, text: `Count: ${bio.value.length}/500` })
		setFavGame({ ...favGame, error: false, text: "" })
	}

	// saves all changes the user made to the db
	const saveChanges = async () => {
		let profilePicChanged = false
		resetTextErrors()
		if (!isFieldEmpty("Profile name", profileName, setProfileName) && !isFieldEmpty("Bio", bio, setBio) && !isFavGameEmpty()) {
			let photoURL = ""
			if (photo.file) {
				photoURL = await uploadProfilePic(photo.file)
				profilePicChanged = true
			}
			await updateDoc(userRef, {
				name: profileName.value,
				bio: bio.value,
				favGame: favGame.value,
				profilePic: profilePicChanged ? photoURL : userPhoto
			})
			successToast("Changes saved.", 3000)
			if (profilePicChanged) {
				window.location.reload()
			}
		}
	}

	// deletes the user's account from the db
	const handleDeleteAccount = async () => {
		setLoadingDelete(true)
		if (userPhoto && userPhoto !== "") await deleteOldProfilePic()

		signOut(auth)
		deleteAccount({})
			.then((res) => {
				console.log(`[deleteAccount]: deleteAccount() done`)
			})
			.catch((msg) => {
				console.log(msg)
				setLoadingDelete(false)
			})
	}

	return (
		<>
			<div className="content-wrapper">
				<Dialog
					open={openConfirmDeleteAccount}
					onClose={handleCloseConfirmDeleteAccount}
					PaperProps={{
						style: {
							backgroundColor: "transparent",
							boxShadow: "none"
						}
					}}>
					<DialogTitle id="alert-dialog-title" sx={{ bgcolor: "#252525", color: "#FFF" }}>
						{"Delete Your Account?"}
					</DialogTitle>
					<DialogContent sx={{ bgcolor: "#252525" }}>
						<DialogContentText id="alert-dialog-description" sx={{ color: "#FFF" }}>
							This will delete your Leaderboard account forever! This action will delete all of your data from our platform, including but not
							limited to:
							<br />
							<br />- All your Reviews
							<br />- All your Lists
							<br />- All your TierLists
							<br />- All your Comments
							<br />- All your Likes and Dislikes to any other content
							<br />- Your profile picture
							<br />
							<br />
							If you are sure you want to perform this action and delete your account from Leaderboard, press the DELETE ACCOUNT button. This
							action is not reversible.
						</DialogContentText>
					</DialogContent>
					<DialogActions sx={{ bgcolor: "#252525" }}>
						<Button onClick={handleCloseConfirmDeleteAccount} sx={{ color: "#FFF" }}>
							Cancel
						</Button>
						<Tooltip title="There is no backsies :(">
							<Button
								onClick={() => handleDeleteAccount()}
								sx={{
									color: "#FFF",
									background: "linear-gradient(#EE4B2B,#880808)"
								}}>
								{loadingDelete ? "Please Wait" : "Delete Account"}
							</Button>
						</Tooltip>
					</DialogActions>
				</Dialog>

				<Navbar />
				<SideNav />
				<Grid container>
					<Grid item xs={1} sm={2} md={3}></Grid>
					<Grid item xs={10} sm={8} md={6} className="box" borderRadius={3} sx={{ mt: 2, mb: 2, p: 2, width: "auto", maxWidth: 915 }}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<ThemeProvider theme={theme}>
									<Typography variant="h3" sx={{ flexGrow: 1 }}>
										Settings
									</Typography>
								</ThemeProvider>
							</Grid>

							<Grid item container spacing={2}>
								<Grid md={7} sm={12} xs={12} item>
									<Box borderRadius={1} sx={{ mb: 5 }}>
										<TextField
											sx={{ width: { xs: 1, backgroundColor: "#ffffff" } }}
											id="filled-basic"
											label="Profile Name"
											variant="filled"
											error={profileName.error}
											helperText={profileName.text}
											value={profileName.value}
											onChange={handleProfileNameChange}
										/>
									</Box>

									<Box borderRadius={1}>
										<TextField
											inputProps={{
												style: { color: "#000000" },
												maxLength: 500
											}}
											multiline
											rows={12}
											sx={{ width: { xs: 1, backgroundColor: "#ffffff" } }}
											id="filled-basic"
											label="Bio"
											variant="filled"
											error={bio.error}
											helperText={bio.text}
											value={bio.value}
											onChange={handleBioChange}
										/>
									</Box>
									{favGame.value !== null && (
										<Box sx={{ mb: 3 }}>
											<ThemeProvider theme={theme}>
												<Typography sx={{ mt: 1 }}>Favorite Game</Typography>
											</ThemeProvider>
											<SearchDropdrownComponent
												handleFavGameChange={handleFavGameChange}
												defaultValue={defaultFavGame}
												setDefaultValue={setDefaultFavGame}
											/>
										</Box>
									)}
								</Grid>

								<Grid
									item
									md={5}
									sm={8}
									xs={8}
									sx={{
										display: "flex",
										justifyContent: { md: "center", sx: "left" },
										mb: { xs: 2 }
									}}>
									<Grid item align="center">
										<ThemeProvider theme={theme}>
											<Typography sx={{ mb: 1 }}>Profile Picture</Typography>
										</ThemeProvider>
										{/* Display original profile picture */}
										{userPhoto && !photoValue && <Avatar alt="Preview Profile Pic" src={userPhoto} sx={{ width: 150, height: 150 }} />}
										{/* Display new uploaded picture */}
										{photoValue && photo.file && <Avatar alt="Preview Profile Pic" src={photoValue} sx={{ width: 150, height: 150 }} />}
										{/* {!photoValue && !photo.file && <Avatar alt="Preview Profile Pic" src={photoValue} sx={{ width: 150, height: 150 }} />} */}

										{!photo.loading && !photo.value && !photo.file && (
											<Button
												variant="contained"
												component="label"
												sx={{
													width: "auto",
													marginRight: 1,
													marginTop: 2,
													background: "linear-gradient(#4f319b,#362269)",
													borderRadius: 2
												}}>
												{userPhoto ? "Update" : "Upload"}
												<input hidden accept="image/*" multiple type="file" onChange={handlePictureUploadChange} />
											</Button>
										)}
										{photo.file && !photo.loading && (
											<Button
												variant="contained"
												component="label"
												color="error"
												sx={{
													width: "auto",
													marginRight: 1,
													marginTop: 1
												}}
												onClick={() => {
													setPhoto({ ...photo, file: null })
													setPhotoValue(null)
												}}>
												X
											</Button>
										)}
									</Grid>
								</Grid>
							</Grid>

							<Grid item container xs={12}>
								<Grid
									item
									container
									xs={12}
									sx={{
										display: "flex",
										justifyContent: "left"
									}}>
									<Grid item xs={12}>
										<Button
											onClick={() => saveChanges()}
											sx={{
												background: "linear-gradient(#4f319b,#362269)",
												borderRadius: 2
											}}
											variant="contained">
											Save Changes
										</Button>
									</Grid>
									<Grid item sx={{ ml: { xs: -2 }, mt: { xs: 2 } }} xs={12}>
										<Button
											onClick={() => navigate(`/${username}`)}
											sx={{
												background: "linear-gradient(#4f319b,#362269)",
												ml: 2,
												borderRadius: 2
											}}
											variant="contained">
											<ArrowBack />
											Profile
										</Button>
									</Grid>
								</Grid>

								<Grid item xs={12} mt={4}>
									<Button
										onClick={handleClickOpenConfirmDeleteAccount}
										sx={{
											background: "linear-gradient(#EE4B2B,#880808)",
											borderRadius: 2
										}}
										variant="contained">
										<ClearRounded />
										Delete Account
									</Button>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={1} sm={2} md={3}></Grid>
			</div>

			<Footer />
			<ToastContainer />
		</>
	)
}

export default SettingsPage
