/*
The Create User Page. This is loaded when a user has first made an account.

This page gathers information about a user's account and saves it to the database.
*/

import { TextField, Box, Grid, createTheme, ThemeProvider, Button, Typography, InputAdornment, Avatar, Tooltip, SvgIcon } from "@mui/material"
import Navbar from "../components/NavbarComponent"
import Footer from "../components/FooterComponent"
import { useState } from "react"
import { auth, db } from "../firebase.config"
import { collection, doc, setDoc, serverTimestamp, getDocs, query, where, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import { uuidv4 } from "@firebase/util"
import { useEffect } from "react"
import Spinner from "../components/Spinner"
import SearchDropdrownComponent from "../components/SearchDropdrownComponent"
import SpinnerComponent from "../components/SpinnerComponent"
import { errorToast } from "../helperFunctions/toasts"
import { ToastContainer } from "react-toastify"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function CreateUserPage() {
	const [username, setUsername] = useState({
		value: "",
		text: "",
		error: false
	})
	const [profileName, setProfileName] = useState({
		value: "",
		text: "",
		error: false
	})
	const [favGame, setFavGame] = useState({ value: "", text: "", error: false })
	const [bio, setBio] = useState({
		value: "",
		text: "Count: 0/500",
		error: false
	})
	const [birthday, setBirthday] = useState({
		value: "",
		text: "",
		error: false
	})
	const [photo, setPhoto] = useState({
		file: null,
		url: "",
		loading: false,
		error: false
	})
	const [photoValue, setPhotoValue] = useState(null)
	const [submitDisabled, setSubmitDisabled] = useState(false)
	const [loading, setLoading] = useState(false)
	const { currentUser } = auth
	const navigate = useNavigate()
	const storage = getStorage()
	const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{2,19}$/
	const dateRegex = /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/

	// check if the user already exists
	useEffect(() => {
		const queryUsername = async () => {
			const docRef = doc(db, "users", currentUser.uid)
			const docSnap = await getDoc(docRef)

			if (docSnap.exists()) {
				// user already exists, create user page should not be entered
				navigate("/")
			}
			setLoading(false)
		}
		if (currentUser) {
			setLoading(true)
			queryUsername()
		} else setLoading(false)
	}, [currentUser])

	const handleUsernameChange = (e) => {
		setUsername({ ...username, value: e.target.value })
	}

	const handleProfileNameChange = (e) => {
		setProfileName({ ...profileName, value: e.target.value })
	}

	const handleFavGameChange = (value) => {
		setFavGame({ ...favGame, value: value })
	}

	const handleBioChange = (e) => {
		const bioText = e.target.value
		const length = bioText.length
		if (length <= 500) {
			setBio({ ...bio, value: bioText, text: `Count: ${length}/500` })
		}
	}

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

	const usernameExists = async () => {
		const usersRef = collection(db, "users")
		const q = query(usersRef, where("username", "==", username.value))
		const querySnapshot = await getDocs(q)
		return querySnapshot.size !== 0
	}

	const regexWorks = (fieldName, field, setField, regex) => {
		const valid = regex.test(field.value)
		if (!valid) {
			setField({
				...field,
				error: true,
				text: `${fieldName} is not in the right format.`
			})
		}

		return valid
	}

	const resetFormErrors = () => {
		setUsername({ ...username, error: false, text: "" })
		setProfileName({ ...profileName, error: false, text: "" })
		setBio({ ...bio, error: false, text: `Count: ${bio.value.length}/500` })
		setBirthday({ ...birthday, error: false, text: "" })
		setFavGame({ ...favGame, error: false, text: "" })
	}

	const isFieldEmpty = (fieldName, field, setField) => {
		const fieldEmpty = field.value === "" || !field.value
		if (fieldEmpty) {
			setField({
				...field,
				error: true,
				text: `${fieldName} field cannot be empty.`
			})
			if (field === "Favorite game") {
				errorToast(`${field} cannot be empty!`)
			}
		}
		return fieldEmpty
	}

	const uploadProfilePic = async (file) => {
		// creates placeholder that will go in Firebase Storage
		const storageRef = ref(storage, "images/" + `${currentUser.uid}-${uuidv4()}`)
		setPhoto({ ...photo, loading: true })
		const metadata = {
			contentType: "image/jpeg"
		}

		// uploads the picture to Storage
		const snapshot = await uploadBytes(storageRef, file, metadata)
		return await getDownloadURL(storageRef)
	}

	const createUser = async () => {
		setSubmitDisabled(true)
		resetFormErrors()
		// check any errors
		if (regexWorks("Username", username, setUsername, usernameRegex)) {
			if (await usernameExists()) {
				setUsername({
					...username,
					error: true,
					text: "Username already exists!"
				})
			} else {
				if (
					!isFieldEmpty("Username", username, setUsername) &&
					!isFieldEmpty("Profile name", profileName, setProfileName) &&
					!isFieldEmpty("Favorite game", favGame, setFavGame) &&
					!isFieldEmpty("Birthday", birthday, setBirthday) &&
					regexWorks("Birthday", birthday, setBirthday, dateRegex) &&
					!isFieldEmpty("Bio", bio, setBio)
				) {
					let photoURL = ""
					if (photo.file) {
						photoURL = await uploadProfilePic(photo.file)
					}
					// create user and redirect them to home page
					await setDoc(doc(db, "users", currentUser.uid), {
						username: username.value,
						email: currentUser.email,
						name: profileName.value,
						profilePic: photoURL,
						bio: bio.value,
						favGame: favGame.value,
						createdAt: serverTimestamp(),
						birthday: birthday.value,
						following: [],
						followers: [],
						notifications: [],
						reviews: [],
						lists: [],
						tierlists: [],
						backlog: [],
						darkMode: false,
						recommended: {},
						topRecommended: [],
						comments: [],
						badges: { 0: "reviewsBase", 1: "likesBase", 2: "allLikesBase", 3: "followerBase", 4: "listBase", 5: "bookmarkBase" }
					})
					navigate("/")
				}
			}
		}
		setSubmitDisabled(false)
	}

	if (loading) return <Spinner />

	return (
		<>
			<div className="content-wrapper">
				<Grid container>
					<Grid item xs={1} sm={2} lg={3}></Grid>
					<Grid item xs={10} sm={8} lg={6} maxWidth={6} className="box" borderRadius={3} sx={{ mt: 2, mb: 2, p: 2, width: "auto", maxWidth: 915 }}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<ThemeProvider theme={theme}>
									<Typography variant="h3" sx={{ flexGrow: 1 }}>
										Create Your Account
									</Typography>
								</ThemeProvider>
							</Grid>

							<Grid item xs={12} md={6}>
								<Typography sx={{ mb: 2 }}>(*) Required</Typography>
								<Typography>* Username:</Typography>
								<Tooltip
									title="Handles can contain lowercase characters a-z, 0-9, and underscores. No special symbols. 
									Length must be between 3 and 20 characters long">
									<Box borderRadius={1}>
										<TextField
											sx={{ width: "270px", backgroundColor: "#fff" }}
											id="filled-basic"
											InputProps={{
												startAdornment: <InputAdornment position="start">@</InputAdornment>
											}}
											error={username.error}
											helperText={username.text}
											value={username.value}
											onChange={handleUsernameChange}
										/>
									</Box>
								</Tooltip>

								<Typography color="#555" sx={{ mb: 3 }}>
									*This cannot be changed later
								</Typography>

								<Typography>* Profile Name:</Typography>
								<Box borderRadius={1} sx={{ mb: 5 }}>
									<TextField
										sx={{ width: "270px", backgroundColor: "#fff" }}
										id="filled-basic"
										error={profileName.error}
										helperText={profileName.text}
										value={profileName.value}
										onChange={handleProfileNameChange}
									/>
								</Box>

								<Typography>* Birthday:</Typography>

								<Box borderRadius={1} sx={{ mb: 5 }}>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<DesktopDatePicker
											inputFormat="MM/DD/YYYY"
											value={birthday.value}
											onChange={(value) => {
												setBirthday({
													...birthday,
													value: value !== null ? value.format("MM/DD/YYYY") : ""
												})
											}}
											renderInput={(params) => (
												<TextField
													{...params}
													sx={{ width: "270px", backgroundColor: "#fff" }}
													error={birthday.error}
													helperText={birthday.text}
												/>
											)}
										/>
									</LocalizationProvider>
								</Box>

								<Typography>* Select Favorite Game:</Typography>

								<SearchDropdrownComponent handleFavGameChange={handleFavGameChange} />
							</Grid>
							<Grid item xs={12} md={6}>
								<Grid item sx={{ ml: { xs: 8, md: 0 } }}>
									<ThemeProvider theme={theme}>
										<Typography variant="h6" sx={{ flexGrow: 1 }}>
											Profile Picture
										</Typography>
									</ThemeProvider>
									{photoValue && photo.file && <Avatar alt="Preview Profile Pic" src={photoValue} sx={{ width: 150, height: 150 }} />}
									{!photoValue && !photo.file && <Avatar alt="Preview Profile Pic" src={photoValue} sx={{ width: 150, height: 150 }} />}
									{!photo.loading && !photo.value && !photo.file && (
										<Button
											variant="contained"
											component="label"
											sx={{
												width: "auto",
												mr: 1,
												mt: 1,
												mb: 2,
												background: "linear-gradient(#4f319b,#362269)"
											}}>
											Upload Image
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
								<Typography>* Bio:</Typography>
								<Box borderRadius={1}>
									<TextField
										inputProps={{ style: { color: "#000" }, maxLength: 500 }}
										multiline
										rows={12}
										sx={{ width: "270px", backgroundColor: "#fff" }}
										id="filled-basic"
										error={bio.error}
										helperText={bio.text}
										value={bio.value}
										onChange={handleBioChange}
									/>
								</Box>
								<Button
									onClick={() => createUser()}
									sx={{ mt: 4, minWidth: "170px", minHeight: "50px", background: "linear-gradient(#4f319b,#362269)" }}
									variant="contained"
									disabled={submitDisabled}>
									{submitDisabled ? (
										<>
											<SpinnerComponent size={10} override={{}} />
										</>
									) : (
										"Create Account"
									)}
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={1} sm={2} lg={3}></Grid>
			</div>
			<Footer />
			<ToastContainer />
		</>
	)
}

export default CreateUserPage
