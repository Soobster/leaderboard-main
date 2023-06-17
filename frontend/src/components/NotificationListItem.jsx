/*
The NotificationListItem. These are displayed in the notification list and displays information about the notification
received. The user profile picture is displayed, as well as a description of the notification, and either a game cover
or a list icon. The profile pic redirects to the user profile while the game cover redirects to the game page.

Hovering over a list item marks it as read removing the red dot "unread" status. Clicking the 'x' on the right will
remove the list item from the notification list.

These are ordered from most to least recently received.

*/
import { Brightness1, Close, ListRounded } from "@mui/icons-material"
import { Avatar, Card, CardMedia, IconButton, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../firebase.config"

function NotificationListItem({ notification, timeAgo, setNotifications }) {
	const navigate = useNavigate()
	const notificationDate = new Date(notification.createdAt.seconds * 1000)
	const [seen, setSeen] = useState(notification.seen)
	const { currentUser } = auth
	const userRef = doc(db, "users", currentUser.uid)

	const seeNotif = async () => {
		setSeen(true)
		const userSnap = await getDoc(userRef)
		const notifications = userSnap.data().notifications
		for (const notif of notifications) {
			if (notif.id === notification.id) {
				notif.seen = true
			}
		}
		updateDoc(userRef, {
			notifications: notifications
		})
		setNotifications(notifications)
	}

	const removeNotif = async () => {
		const userSnap = await getDoc(userRef)
		let notifications = userSnap.data().notifications
		notifications = notifications.filter((notif) => notif.id !== notification.id)
		updateDoc(userRef, {
			notifications: notifications
		})
		// setRerender(rerender ? false : true)
		setNotifications(notifications)
	}

	return (
		<ListItem sx={{ p: 0.5 }} disableGutters alignItems="flex-start" onMouseEnter={() => seeNotif()}>
			{!seen && <Brightness1 sx={{ color: "red", fontSize: 10 }} />}
			<ListItemAvatar>
				<Avatar
					src={notification.senderProfilePic}
					onClick={() => navigate(`/${notification.data.username}`)}
					sx={{ ml: 1, mt: 1, "&:hover": { cursor: "pointer", boxShadow: "0px 0px 20px #4C2F97" } }}
				/>
			</ListItemAvatar>
			<ListItemText
				sx={{ m: 1 }}
				secondary={
					<>
						<Typography sx={{ display: "block", color: "#fff" }} component="span" variant="body2">
							{notification.text}
						</Typography>

						<Typography sx={{ display: "block" }} component="span" variant="body2" color="#a3a3a3">
							{timeAgo.format(notificationDate)}
						</Typography>
					</>
				}
			/>
			{/* Show game data conditionally based on if a gameCover was passed in the data */}
			{notification.data.gameCover && (
				<Card
					sx={{ maxWidth: 40, mt: 1, "&:hover": { cursor: "pointer", boxShadow: "0px 0px 20px #4C2F97" } }}
					onClick={() => navigate(`/game/${notification.data.gameId}`)}>
					<CardMedia component="img" image={notification.data.gameCover} />
				</Card>
			)}
			{/* sx={{ textDecoration: "none", fontFamily: "Helvetica", "&:hover": { textDecoration: "underline" } }}> */}
			{notification.data.listID && (
				<IconButton
					sx={{ m: 0, ml: -1, p: 0, mt: 1 }}
					onClick={() => navigate(`/${notification.data.listOwnerUsername}/${notification.data.listType}/view/${notification.data.listID}`)}>
					<ListRounded fontSize="inherit" sx={{ minWidth: "40px", minHeight: "40px" }} />
				</IconButton>
			)}
			{
				<IconButton
					sx={{ p: 0, m: 0.4 }}
					onClick={() => {
						removeNotif()
					}}>
					<Close sx={{ fontSize: 15, pt: 2 }} />
				</IconButton>
			}
		</ListItem>
	)
}

export default NotificationListItem
