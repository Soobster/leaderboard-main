/**
 * Navbar component. Shows the logo of Leaderboard, search bar, a hamburger menu, notifications and the profile picture.
 *
 * A notification can be triggered by many scenarios. When deconstructing the notifications object, the property scenario
 * can be taken and each number have a different meaning:
 * - 0: someone upvotes your review
 * - 1: someone upvotes your list
 * - 2: someone you follow wrote a review
 * - 3: someone you follow created a list/tierlist
 * - 4: someone followed you
 */

import { alpha, AppBar, Avatar, Badge, Box, Button, IconButton, InputBase, List, Menu, MenuItem, Popover, styled, Toolbar, Typography } from "@mui/material"
import { ListRounded, LogoutRounded, MenuRounded, Notifications, Bookmarks, SearchRounded, SettingsRounded, SportsEsportsRounded } from "@mui/icons-material"
import { useState } from "react"
import { UserAuth } from "../context/AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase.config"

// import and set TimeAgo
import en from "javascript-time-ago/locale/en"
import TimeAgo from "javascript-time-ago"
import NotificationListItem from "./NotificationListItem"
TimeAgo.addLocale(en)

const Search = styled("div")(({ theme }) => ({
	position: "relative",
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	"&:hover": {
		backgroundColor: alpha(theme.palette.common.white, 0.25)
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: "100%",
	[theme.breakpoints.up("sm")]: {
		marginLeft: theme.spacing(3),
		width: "auto"
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

function Navbar() {
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null)
	const [notifAnchorEl, setNotifAnchorEl] = useState(null)
	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
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
				console.log("[Navbar]: Could not get user's data")
			}
		}
		getUserInfo()
	}, [user, notifications])

	const handleMobileMenuClose = () => {
		setMobileMoreAnchorEl(null)
	}

	const handleMobileMenuOpen = (event) => {
		setMobileMoreAnchorEl(event.currentTarget)
	}

	const handleNotifClick = (e) => {
		setNotifAnchorEl(e.currentTarget)
	}

	const handleNotifClose = () => {
		setNotifAnchorEl(null)
	}

	const handleSignOut = async () => {
		try {
			await logout()
			navigate("/auth")
		} catch (error) {
			console.log(error)
		}
	}

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && e.target.value !== "") {
			navigate(`/search/${e.target.value}`)
			if (location.pathname.startsWith("/search")) window.location.reload()
		}
	}

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

	const mobileMenuId = "primary-search-account-menu-mobile"
	const renderMobileMenu = (
		<Menu
			anchorEl={mobileMoreAnchorEl}
			anchorOrigin={{
				vertical: "top",
				horizontal: "right"
			}}
			id={mobileMenuId}
			keepMounted
			transformOrigin={{
				vertical: "top",
				horizontal: "right"
			}}
			open={isMobileMenuOpen}
			onClose={() => handleMobileMenuClose()}>
			<Box sx={{ display: { xs: "flex", md: "none" } }}>
				<MenuItem onClick={handleNotifClick}>
					<IconButton size="large" aria-label="show 17 new notifications" color="inherit">
						<Badge badgeContent={unseenCount} color="error">
							<Notifications />
						</Badge>
					</IconButton>
					<p>Notifications</p>
				</MenuItem>
			</Box>
			<Box
				sx={{ display: { xs: "flex", md: "none" } }}
				onClick={() => {
					navigate(`/${username}`)
				}}>
				<MenuItem>
					<Button>
						<Avatar alt="username" src={userProfilePic} sx={{ width: 25, height: 25, ml: -2 }} />
					</Button>
					<Box>
						<Typography ml={-2}>Profile</Typography>
					</Box>
				</MenuItem>
			</Box>
			<MenuItem
				onClick={() => {
					navigate(`/${username}/gamesreviewed`)
				}}>
				<IconButton size="large" aria-label="account of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" color="inherit">
					<SportsEsportsRounded />
				</IconButton>
				<p>All Games</p>
			</MenuItem>
			<MenuItem
				onClick={() => {
					navigate(`/${username}/backlog`)
				}}>
				<IconButton size="large" aria-label="account of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" color="inherit">
					<Bookmarks />
				</IconButton>
				<p>Backlog</p>
			</MenuItem>
			<MenuItem
				onClick={() => {
					navigate(`/${username}/lists`)
				}}>
				<IconButton size="large" aria-label="account of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" color="inherit">
					<ListRounded />
				</IconButton>
				<p>Lists</p>
			</MenuItem>
			<MenuItem
				onClick={() => {
					navigate("/settings")
				}}>
				<IconButton size="large" aria-label="account of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" color="inherit">
					<SettingsRounded />
				</IconButton>
				<p>Settings</p>
			</MenuItem>
			<MenuItem onClick={handleSignOut}>
				<IconButton size="large" aria-label="account of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" color="inherit">
					<LogoutRounded />
				</IconButton>
				<p>Logout</p>
			</MenuItem>
		</Menu>
	)

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar
				position="static"
				sx={{
					background: "linear-gradient(#4f319b,#362269)"
				}}>
				<Toolbar sx={{ maxWidth: "1000px", mx: "auto" }}>
					<Box sx={{ display: { xs: "none", sm: "flex" } }}>
						<img
							src={require("../assets/Leaderboard_Logos/logo&text_black_transparent.png")}
							width={200}
							alt={"Leaderboard logo"}
							style={{ cursor: "pointer" }}
							onClick={() => {
								navigate("/")
							}}></img>
					</Box>
					<Box sx={{ display: { xs: "flex", sm: "none" }, m: 0.25, mr: 5 }}>
						<img
							src={require("../assets/Leaderboard_Logos/logo_black_transparent.png")}
							width={60}
							alt={"Leaderboard logo small"}
							style={{ cursor: "pointer" }}
							onClick={() => {
								navigate("/")
							}}></img>
					</Box>
					<Box sx={{ display: { xs: "none", md: "flex" }, mr: 10, ml: 10 }}></Box>
					<Search>
						<SearchIconWrapper>
							<SearchRounded />
						</SearchIconWrapper>
						<StyledInputBase
							sx={{ width: { sm: "300px" } }}
							placeholder="Search…"
							inputProps={{ "aria-label": "search" }}
							onKeyUp={handleKeyDown}
						/>
					</Search>
					<Box sx={{ display: { xs: "flex", lg: "none" } }}>
						<IconButton
							size="large"
							aria-label="show more"
							aria-controls={mobileMenuId}
							aria-haspopup="true"
							onClick={handleMobileMenuOpen}
							color="inherit">
							<MenuRounded />
						</IconButton>
					</Box>
					<Box sx={{ display: { xs: "none", md: "flex" } }}>
						<IconButton size="large" color="inherit" onClick={handleNotifClick}>
							<Badge badgeContent={unseenCount} color="error">
								<Notifications />
							</Badge>
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
						<Button
							onClick={() => {
								navigate(`/${username}`)
							}}>
							<Avatar alt="username" src={userProfilePic} sx={{ width: 50, height: 50 }} />
						</Button>
					</Box>
				</Toolbar>
			</AppBar>
			{renderMobileMenu}
		</Box>
	)
}

export default Navbar
