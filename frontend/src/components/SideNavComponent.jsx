/**
 * SideNav component. Shows the logo of Leaderboard, search bar, a hamburger menu, notifications and the profile picture.
 *
 * A notification can be triggered by many scenarios. When deconstructing the notifications object, the property scenario
 * can be taken and each number have a different meaning:
 * - 0: someone upvotes your review
 * - 1: someone upvotes your list
 * - 2: someone you follow wrote a review
 * - 3: someone you follow created a list/tierlist
 * - 4: someone followed you
 */

import {
	alpha,
	Avatar,
	Badge,
	Box,
	Button,
	Drawer,
	IconButton,
	InputBase,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Popover,
	styled,
	Typography
} from "@mui/material"
import { Home, ListRounded, LogoutRounded, Notifications, Bookmarks, SearchRounded, SettingsRounded, SportsEsportsRounded } from "@mui/icons-material"
import { useState } from "react"
import { UserAuth } from "../context/AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase.config"
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft"
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight"
import ManageSearchIcon from "@mui/icons-material/ManageSearch"

// import and set TimeAgo
import en from "javascript-time-ago/locale/en"
import TimeAgo from "javascript-time-ago"
import NotificationListItem from "./NotificationListItem"
TimeAgo.addLocale(en)

// seacrh bar
const Search = styled("div")(({ theme }) => ({
	position: "relative",
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	"&:hover": {
		backgroundColor: alpha(theme.palette.common.white, 0.25)
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: 210,
	[theme.breakpoints.up("sm")]: {
		marginLeft: theme.spacing(1)
		// width: "auto"
	}
}))

const SearchIconWrapper = styled("div")(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: "100%",
	position: "absolute",
	pointerEvents: "none",
	display: "flex",
	alignItems: "center",
	justifyContent: "center"
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		width: "100%",
		[theme.breakpoints.up("md")]: {
			width: "20ch"
		}
	}
}))

function SideNav() {
	const [notifAnchorEl, setNotifAnchorEl] = useState(null)
	const [userProfilePic, setUserProfilePic] = useState(null)
	const [username, setUsername] = useState(null)
	const [notifications, setNotifications] = useState(null)
	const [unseenCount, setUnseenCount] = useState(0)
	const location = useLocation()
	const { currentUser } = auth
	const { logout, user } = UserAuth()
	const navigate = useNavigate()
	// notification popover anchor vars
	const open = Boolean(notifAnchorEl)
	const notifId = open ? "simple-popover" : undefined
	// Create formatter (English).
	const timeAgo = new TimeAgo("en-US")

	const [drawerOpen, setDrawerOpen] = useState(false)

	// extends side nav
	const handleDrawerOpen = () => {
		if (!drawerOpen) setDrawerOpen(true)
	}

	// shrinks side nav
	const handleDrawerClose = () => {
		setDrawerOpen(false)
	}

	// gets user data side nav depends on
	useEffect(() => {
		const getUserInfo = async () => {
			const userRef = doc(db, "users", currentUser.uid)
			const docSnap = await getDoc(userRef)

			if (docSnap.exists()) {
				setUserProfilePic(docSnap.data().profilePic)
				setUsername(docSnap.data().username)
				const notifications = docSnap.data().notifications
				const unseenNotifications = notifications.filter((notification) => notification.seen === false)
				setUnseenCount(unseenNotifications.length)
				setNotifications(notifications)
			} else {
				console.log("[SideNav]: Could not get user's data")
			}
		}
		getUserInfo()
	}, [user, notifications])

	// handles notification modal opening
	const handleNotifClick = (e) => {
		setNotifAnchorEl(e.currentTarget)
	}

	// handles notification modal closing
	const handleNotifClose = () => {
		setNotifAnchorEl(null)
	}

	// handles signing out right from the side nav
	const handleSignOut = async () => {
		try {
			await logout()
			navigate("/auth")
		} catch (error) {
			console.log(error)
		}
	}

	// handles searching inside side nav
	const handleKeyDown = (e) => {
		if (e.key === "Enter" && e.target.value !== "") {
			navigate(`/search/${e.target.value}`)
			if (location.pathname.startsWith("/search")) window.location.reload()
		}
	}

	// displays notifications in a modal
	const NotificationsJSX = () => {
		if (!notifications.length)
			return (
				<>
					<Typography sx={{ p: 2 }}>No notifications for now.</Typography>
				</>
			)
		let notificationsArr = []
		for (const [i, notification] of notifications.entries()) {
			notificationsArr.push(<NotificationListItem notification={notification} key={i} timeAgo={timeAgo} setNotifications={setNotifications} />)
		}
		return notificationsArr.reverse()
	}

	return drawerOpen ? (
		<Drawer
			anchor="left"
			open={{ md: drawerOpen, lg: drawerOpen }}
			variant="persistent"
			sx={{
				display: { xs: "none", sm: "none", md: "none", lg: "flex" },
				flexShrink: 1,
				height: "95%"
			}}>
			<Box sx={{ background: "linear-gradient(#151515, #222)", height: "100%", width: "100%" }}>
				<List sx={{ height: "92%" }}>
					<ListItem key={0}>
						<ListItemButton
							onClick={() => {
								navigate("/")
							}}>
							<Box>
								<img
									sx={{ align: "center" }}
									src={require("../assets/Leaderboard_Logos/logo&text_white_purple_transparent.png")}
									height={45}
									alt={"Leaderboard logo"}
									style={{ cursor: "pointer" }}></img>
							</Box>
						</ListItemButton>
					</ListItem>
					<ListItem key={1}>
						<ListItemButton
							sx={{ color: "#FFF" }}
							onClick={() => {
								navigate("/")
							}}>
							<ListItemIcon sx={{ color: "#FFF" }}>
								<Home></Home>
							</ListItemIcon>
							<ListItemText>Home</ListItemText>
						</ListItemButton>
					</ListItem>
					<ListItem key={2}>
						<Search>
							<SearchIconWrapper>
								<SearchRounded />
							</SearchIconWrapper>
							<StyledInputBase placeholder="Search…" inputProps={{ "aria-label": "search" }} onKeyUp={handleKeyDown} />
						</Search>
					</ListItem>
					<ListItem key={3}>
						<IconButton size="large" onClick={handleNotifClick} sx={{ color: "#fff" }}>
							<Badge badgeContent={unseenCount} color="error" sx={{ width: 30, height: 30, mr: 3.5 }}>
								<Notifications />
							</Badge>
							<Typography color="#fff"> Notifications </Typography>
						</IconButton>
						<Popover
							id={notifId}
							open={open}
							anchorEl={notifAnchorEl}
							onClose={handleNotifClose}
							sx={{}}
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "left"
							}}
							transformOrigin={{
								vertical: "top",
								horizontal: "center"
							}}>
							<List
								sx={{ width: "100%", maxWidth: 360, maxHeight: "500px", overflow: "auto", boxShadow: "0px 0px 30px #000", bgcolor: "#494949" }}>
								{notifications && NotificationsJSX()}
							</List>
						</Popover>
					</ListItem>
					<ListItem key={4}>
						<ListItemButton
							onClick={() => {
								navigate(`/${username}/gamesreviewed`)
							}}>
							<ListItemIcon sx={{ color: "#FFF" }}>
								<SportsEsportsRounded />
							</ListItemIcon>
							<Typography color="#fff"> All Games </Typography>
						</ListItemButton>
					</ListItem>
					<ListItem key={5}>
						<ListItemButton
							onClick={() => {
								navigate(`/${username}/backlog`)
							}}>
							<ListItemIcon sx={{ color: "#FFF" }}>
								<Bookmarks />
							</ListItemIcon>
							<Typography color="#fff"> Backlog </Typography>
						</ListItemButton>
					</ListItem>
					<ListItem key={6}>
						<ListItemButton
							onClick={() => {
								navigate(`/${username}/lists`)
							}}>
							<ListItemIcon sx={{ color: "#FFF" }}>
								<ListRounded />
							</ListItemIcon>
							<Typography color="#fff"> Lists </Typography>
						</ListItemButton>
					</ListItem>
					<ListItem key={7}>
						<ListItemButton
							onClick={() => {
								navigate("/settings")
							}}>
							<ListItemIcon sx={{ color: "#FFF" }}>
								<SettingsRounded />
							</ListItemIcon>
							<Typography color="#fff"> Settings </Typography>
						</ListItemButton>
					</ListItem>
					<ListItem key={8}>
						<ListItemButton onClick={handleSignOut}>
							<ListItemIcon sx={{ color: "#FFF" }}>
								<LogoutRounded />
							</ListItemIcon>
							<Typography color="#fff"> Logout </Typography>
						</ListItemButton>
					</ListItem>
					<ListItem key={9}>
						<ListItemButton
							onClick={() => {
								navigate(`/${username}`)
							}}>
							<ListItemIcon sx={{ color: "#FFF" }}>
								<Avatar alt="username" src={userProfilePic} sx={{ width: 30, height: 30 }} />
							</ListItemIcon>
							<Typography color="#fff"> Profile </Typography>
						</ListItemButton>
					</ListItem>
				</List>
				<Box sx={{ alignSelf: "stretch", height: "5%" }}>
					<Button
						sx={{ color: "#FFF" }}
						onClick={() => {
							handleDrawerClose()
						}}>
						<KeyboardDoubleArrowLeftIcon color="#fff"></KeyboardDoubleArrowLeftIcon>
					</Button>
				</Box>
			</Box>
		</Drawer>
	) : (
		<>
			<Drawer
				anchor="left"
				open={!drawerOpen}
				variant="persistent"
				sx={{
					display: { xs: "none", lg: "flex" },
					flexShrink: 1,
					height: "95%"
				}}>
				<Box sx={{ background: "linear-gradient(#151515, #222)", height: "100%", width: 90 }}>
					<List sx={{ height: "92%" }}>
						<ListItem key={0}>
							<ListItemButton
								onClick={() => {
									navigate("/")
								}}>
								<Box ml={-1}>
									<img
										sx={{ align: "left" }}
										src={require("../assets/Leaderboard_Logos/logo_white_purple_transparent.png")}
										height={50}
										alt={"Leaderboard logo"}
										style={{ cursor: "pointer" }}
										onClick={() => {
											navigate("/")
										}}></img>
								</Box>
							</ListItemButton>
						</ListItem>
						<ListItem key={1}>
							<ListItemButton
								onClick={() => {
									navigate("/")
								}}>
								<ListItemIcon sx={{ color: "#FFF" }}>
									<Home sx={{ color: "#FFF" }}></Home>
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						<ListItem key={2}>
							<ListItemButton onClick={handleDrawerOpen}>
								<ListItemIcon sx={{ color: "#FFF" }}>
									<ManageSearchIcon></ManageSearchIcon>
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						<ListItem key={3}>
							<IconButton size="large" onClick={handleNotifClick} sx={{ color: "#fff" }}>
								<Badge badgeContent={unseenCount} color="error" sx={{ width: 30, height: 30 }}>
									<Notifications />
								</Badge>
							</IconButton>
							<Popover
								id={notifId}
								open={open}
								anchorEl={notifAnchorEl}
								onClose={handleNotifClose}
								anchorOrigin={{
									vertical: "bottom",
									horizontal: "left"
								}}
								transformOrigin={{
									vertical: "top",
									horizontal: "center"
								}}>
								<List
									sx={{
										width: "100%",
										maxWidth: 360,
										maxHeight: "500px",
										overflow: "auto",
										boxShadow: "0px 0px 30px #000",
										bgcolor: "#494949"
									}}>
									{notifications && NotificationsJSX()}
								</List>
							</Popover>
						</ListItem>
						<ListItem key={4}>
							<ListItemButton
								onClick={() => {
									navigate(`/${username}/gamesreviewed`)
								}}>
								<ListItemIcon sx={{ color: "#FFF" }}>
									<SportsEsportsRounded />
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						<ListItem key={5}>
							<ListItemButton
								onClick={() => {
									navigate(`/${username}/backlog`)
								}}>
								<ListItemIcon sx={{ color: "#FFF" }}>
									<Bookmarks />
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						<ListItem key={6}>
							<ListItemButton
								onClick={() => {
									navigate(`/${username}/lists`)
								}}>
								<ListItemIcon sx={{ color: "#FFF" }}>
									<ListRounded />
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						<ListItem key={7}>
							<ListItemButton
								onClick={() => {
									navigate("/settings")
								}}>
								<ListItemIcon sx={{ color: "#FFF" }}>
									<SettingsRounded />
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						<ListItem key={8}>
							<ListItemButton onClick={handleSignOut}>
								<ListItemIcon sx={{ color: "#FFF" }}>
									<LogoutRounded />
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
						<ListItem key={9}>
							<ListItemButton
								onClick={() => {
									navigate(`/${username}`)
								}}>
								<ListItemIcon sx={{ color: "#FFF" }}>
									<Avatar alt="username" src={userProfilePic} sx={{ width: 30, height: 30 }} />
								</ListItemIcon>
							</ListItemButton>
						</ListItem>
					</List>
					<Box sx={{ alignSelf: "stretch", height: "5%" }}>
						<Button
							sx={{ color: "#FFF" }}
							onClick={() => {
								handleDrawerOpen()
							}}>
							<KeyboardDoubleArrowRightIcon color="inherit"></KeyboardDoubleArrowRightIcon>
						</Button>
					</Box>
				</Box>
			</Drawer>
		</>
	)
}

export default SideNav
