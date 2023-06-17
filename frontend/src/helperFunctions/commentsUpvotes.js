/*
Helper function for liking and disliking for comments
*/

import { arrayRemove, arrayUnion, doc, getDoc, Timestamp, updateDoc } from "firebase/firestore"
import { db } from "../firebase.config"
import { uuidv4 } from "@firebase/util"

export const setCommentUpvoteSelection = async (collection, userID, commentID, setUpvote, setDownvote) => {
	const commentDocRef = await doc(db, collection, commentID)
	const commentSnap = await getDoc(commentDocRef)
	const upvotesArray = commentSnap.get("upvotes")
	const downvotesArray = commentSnap.get("downvotes")

	if (upvotesArray) {
		if (upvotesArray.includes(userID)) {
			setUpvote(true)
			setDownvote(false)
		} else if (downvotesArray.includes(userID)) {
			setUpvote(false)
			setDownvote(true)
		} else {
			setUpvote(false)
			setDownvote(false)
		}
	}
}

// if vote == 0 => downvote, else upvote
export const manageCommentVote = async (vote, collection, userID, ownerID, commentID, setUpvote, setUpvotes, setDownvote, setDownvotes, gameData, listData) => {
	const commentDocRef = await doc(db, collection, commentID)
	const commentSnap = await getDoc(commentDocRef)
	const upvotesArray = commentSnap.get("upvotes")
	const downvotesArray = commentSnap.get("downvotes")

	if (vote ? upvotesArray.includes(userID) : downvotesArray.includes(userID)) {
		await updateDoc(commentDocRef, {
			[`${vote ? "upvotes" : "downvotes"}`]: arrayRemove(userID)
		})
		vote ? setUpvotes(--upvotesArray.length) : setDownvotes(--downvotesArray.length)
		vote ? setUpvote(false) : setDownvote(false)
	} else {
		if (vote ? downvotesArray.includes(userID) : upvotesArray.includes(userID)) {
			await updateDoc(commentDocRef, {
				[`${vote ? "downvotes" : "upvotes"}`]: arrayRemove(userID)
			})
			vote ? setDownvotes(--downvotesArray.length) : setUpvotes(--upvotesArray.length)
			vote ? setDownvote(false) : setUpvote(false)
		}
		await updateDoc(commentDocRef, {
			[`${vote ? "upvotes" : "downvotes"}`]: arrayUnion(userID)
		})

		console.log(userID)
		if (userID !== ownerID) {
			// set notification for user upvoting/downvoting a comment
			const commentUserRef = await doc(db, "users", ownerID)
			const userRef = await doc(db, "users", userID)
			const userSnap = await getDoc(userRef)
			let listOwnerRef
			let listOwnerSnap
			let reviewOwnerRef
			let reviewOwnerSnap
			let notificationText = ""
			if (listData) {
				listOwnerRef = await doc(db, "users", listData.ownerID)
				listOwnerSnap = await getDoc(listOwnerRef)
				notificationText = `@${userSnap.get("username")} liked your comment for ${listData.collection === "tierlists" ? "Tier List" : "List"} "${
					listData.name
				}"!`
			}
			if (gameData) {
				reviewOwnerRef = await doc(db, "users", gameData.ownerID)
				reviewOwnerSnap = await getDoc(reviewOwnerRef)
				notificationText = `@${userSnap.get("username")} liked your comment on @${reviewOwnerSnap.get("username")}'s review for ${
					gameData.gameTitle
				} (${gameData.gameReleaseDate})!`
			}

			updateDoc(commentUserRef, {
				notifications: arrayUnion({
					id: uuidv4(),
					createdAt: Timestamp.now(),
					senderId: userID,
					senderProfilePic: userSnap.get("profilePic"),
					text: notificationText,
					data: {
						// game data if passed in (reviews)
						gameId: gameData ? gameData.gameId : null,
						gameCover: gameData ? gameData.gameCover : null,
						gameTitle: gameData ? gameData.gameTitle : null,
						gameReleaseDate: gameData ? gameData.gameReleaseDate : null,
						// list data if passed in
						listOwnerUsername: listData ? listOwnerSnap.get("username") : null,
						listType: listData ? (listData.collection === "tierlists" ? "tierlist" : "list") : null,
						listID: listData ? listData.id : null,
						username: userSnap.get("username")
					},
					seen: false,
					scenario: 5
				})
			})
		}

		vote ? setUpvotes(++upvotesArray.length) : setDownvotes(++downvotesArray.length)
		vote ? setUpvote(true) : setDownvote(true)
	}
}
