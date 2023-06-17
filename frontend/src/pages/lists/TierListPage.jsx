/*
The Tier List Page. Displays a tier list component.

This page is loaded and shown when a user creates a new tier list or edits an existing tier list.

*/
import React, { useEffect } from "react"
import Navbar from "../../components/NavbarComponent"
import SideNav from "../../components/SideNavComponent"
import TierListComponent from "../../components/lists/TierListComponent"
import Footer from "../../components/FooterComponent"
import { useNavigate, useParams } from "react-router-dom"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../../firebase.config"

function TierListPage() {
	const { username, gameID, listID } = useParams()
	const navigate = useNavigate()

	useEffect(() => {
		const checkUsername = async () => {
			const usersRef = collection(db, "users")
			const q = query(usersRef, where("username", "==", username))
			const userSnapshot = await getDocs(q)
			if (userSnapshot.empty) navigate("/notfound")
		}
		checkUsername()
	}, [username])

	return (
		<>
			<div className="content-wrapper">
				<Navbar />
				<SideNav />
				<TierListComponent gameID={gameID} listID={listID} />
			</div>
			<Footer />
		</>
	)
}

export default TierListPage
