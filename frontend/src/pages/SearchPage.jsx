/*
The SearchPage. This displays the search results for whatever the user typed.

There are three tabs, based on what the user searched, they will get results in these tabs.
The tabs are Games, Users, and Lists.
*/

import { Grid } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import SearchContainerComponent from "../components/SearchContainerComponent"
import Navbar from "../components/NavbarComponent"
import SideNav from "../components/SideNavComponent"
import Spinner from "../components/Spinner"
import Footer from "../components/FooterComponent"
import { auth, db } from "../firebase.config"
import { getDocs } from "firebase/firestore"
import { query, where, collection } from "firebase/firestore"
import { checkGameCacheBySearchTerm } from "../helperFunctions/checkGameCache"

function SearchPage() {
	const { currentUser } = auth
	const userID = currentUser.uid
	let { searchTerm } = useParams()

	const [searchTermState, setSearchTermState] = useState(null)
	const [gameResults, setGameResults] = useState(null)
	const [userResults, setUserResults] = useState(null)
	const [listResults, setListResults] = useState(null)

	if (searchTermState !== searchTerm) {
		setGameResults(null)
		setUserResults(null)
		setListResults(null)
		setSearchTermState(searchTerm)
	}

	// use effect for getting results. checks whether the search term matches games, users, and lists
	useEffect(() => {
		if (!searchTermState) return
		const handleSearchGame = async (searchTermState) => {
			const fetchedData = await checkGameCacheBySearchTerm(searchTermState)
			fetchedData.map((game) => {
				if (game.cover && game.cover.url) game.cover.url = game.cover.url.replace("t_thumb", "t_1080p")
				else return
			})
			// sort results by highest rated
			fetchedData.sort((game1, game2) => {
				return -(game1.rating - game2.rating)
			})
			setGameResults(fetchedData)
		}

		const handleSearchUser = async (searchTermState) => {
			const userResultsArray = []
			if (searchTermState) {
				const incrementedLastChar = String.fromCharCode(searchTerm.charCodeAt(searchTerm.length - 1) + 1)
				const searchTermIncremented = searchTermState.replace(/.$/, incrementedLastChar)
				const usersRef = collection(db, "users")

				const q = query(usersRef, where("username", ">=", searchTermState.toLowerCase()), where("username", "<", searchTermIncremented.toLowerCase()))
				const querySnapshot = await getDocs(q)
				querySnapshot.forEach((doc) => {
					const userResult = doc.data()
					userResult["id"] = doc.id
					userResultsArray.push(userResult)
				})
			}
			setUserResults(userResultsArray)
		}

		const handleSearchList = async (searchTermState) => {
			const listResultsArray = []
			if (searchTermState) {
				const incrementedLastChar = String.fromCharCode(searchTerm.charCodeAt(searchTerm.length - 1) + 1)
				const searchTermIncremented = searchTermState.replace(/.$/, incrementedLastChar)
				const tierListRef = collection(db, "tierlists")
				const listRef = collection(db, "lists")

				const q1 = query(tierListRef, where("name", ">=", searchTermState), where("name", "<", searchTermIncremented))
				const q2 = query(listRef, where("name", ">=", searchTermState), where("name", "<", searchTermIncremented))

				const querySnapshot1 = await getDocs(q1)
				const querySnapshot2 = await getDocs(q2)
				querySnapshot1.forEach((doc) => {
					const listResult = doc.data()
					listResult["id"] = doc.id
					listResultsArray.push(listResult)
				})
				querySnapshot2.forEach((doc) => {
					const listResult = doc.data()
					listResult["id"] = doc.id
					listResultsArray.push(listResult)
				})
			}
			setListResults(listResultsArray)
		}
		handleSearchGame(searchTermState)
		handleSearchUser(searchTermState)
		handleSearchList(searchTermState)
	}, [searchTermState])

	if (!gameResults || !userResults || !listResults) {
		return <Spinner />
	}
	return (
		<>
			<div className="content-wrapper">
				<Navbar />
				<SideNav />
				<Grid container rowSpacing={1} columnSpacing={2} sx={{ width: "auto", mb: 3 }}>
					<Grid item xs={12} align={"center"}>
						<SearchContainerComponent gameData={gameResults} userResults={userResults} listResults={listResults} searchTerm={searchTermState} />
					</Grid>
				</Grid>
			</div>
			<Footer />
		</>
	)
}

export default SearchPage
