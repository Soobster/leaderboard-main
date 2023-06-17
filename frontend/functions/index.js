// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require("firebase-functions")

// backend code
const express = require("express")
const app = express()
const axios = require("axios")

// code needed to not get CORS policy error 'no access-control-allow-credentials'
const cors = require("cors")

const corsOptions = {
	origin: "*",
	credentials: true, // access-control-allow-credentials:true
	optionSuccessStatus: 200
}

app.use(cors(corsOptions))
require("dotenv").config({ path: "./.env" })

app.get("/api/:endpoint/:query", (req, res) => {
	// console.log(`Endpoint being called: ${req.params.endpoint}, query sent: ${req.params.query}`)
	axios({
		url: `https://api.igdb.com/v4/${req.params.endpoint}`,
		method: "POST",
		headers: {
			"Accept": "application/json",
			"Client-ID": `${process.env.IGDB_CLIENT_ID}`,
			"Authorization": `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
			"accept-encoding": "null"
		},
		data: req.params.query
	})
		.then((response) => {
			// console.log(response.data)
			return res.json(response.data)
		})
		.catch((err) => {
			// console.error(err)
			// return res.json({})
			console.log(err.message)
		})
})

// app.listen(process.env.PORT || 3005, () => {
// 	console.log("server started on port 3005")
// })

// **example to fall back on to
// app.get("/api", (req, res) => {
// 	res.json({ "users": ["userOne", "userTwo", "userThree"] })
// })

exports.app = functions.https.onRequest(app)

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin")
admin.initializeApp()

// Leaderboard's NoSQL database
var db = admin.firestore()
const FieldValue = admin.firestore.FieldValue

// highestRatedAlgorithm cloud function
exports.highestRatedGamesAlgorithm = functions.pubsub.schedule("0 0 * * *").onRun(async (context) => {
	await db
		.collection("gameSpecificReviews")
		.get()
		.then(async (querySnapshot) => {
			let globalRatings = []
			// go through every single document in the 'gameSpecificReviews' collection
			for await (const gameSpecificRev of querySnapshot.docs) {
				let ratings = { 0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0 }
				let reviewSum = 0
				let reviewCount = 0
				const reviews = gameSpecificRev.data().reviews
				// for each review in each gameSpecificReviews
				for (let i = 0; i < reviews.length; i++) {
					const reviewId = reviews[i]
					const reviewSnap = await db.collection("reviews").doc(reviewId).get()
					console.log(reviewSnap.id)
					if (!reviewSnap.data()) {
						console.log("[ERROR]: START OF CRASH")
						console.log(`[ERROR]: gameSpecificRev.id: ${gameSpecificRev.id}`)
						console.log(`[ERROR]: reviewSnap.id: ${reviewSnap.id}`)
					}
					const reviewDate = new Date(reviewSnap.data().createdAt.seconds * 1000)
					const dateNow = new Date()
					const dateDiff = Math.abs(dateNow - reviewDate)
					const days = Math.floor(dateDiff / 86400000)
					if (days < 7) {
						// only reviews within 1 week are to be counted
						reviewCount += 1
						const currentRating = reviewSnap.data().rating
						ratings[currentRating] += 1
						reviewSum += currentRating
					}
				}
				const globalRating = reviewSum / reviewCount
				globalRatings.push([gameSpecificRev.id, globalRating])
			}
			// filter out all NaN ratings: this happens for games with no reviews in last week
			globalRatings = globalRatings.filter((r) => isNaN(r[1]) === false)
			// sort ratings in descending order
			globalRatings = globalRatings.sort((a, b) => a[1] - b[1]).reverse()
			// take top 10 ratings and just take their ids
			const ids = globalRatings.slice(0, 10).map((r) => r[0])
			await db.collection("highestRated").doc("games").update({
				top10: ids
			})
		})

	return null
})

exports.addGamesToRecommended = functions.https.onCall(async (data, context) => {
	const reviewedGame = data.reviewedGame
	const similarGames = data.similarGames
	const userID = context.auth.uid
	console.log(`similar games: ${similarGames}`)
	const userSnap = await db.collection("users").doc(userID).get()
	const recommended = userSnap.data().recommended
	const backlog = userSnap.data().backlog
	const reviews = userSnap.data().reviews
	// add/increment each similar game ID to recommended
	for (const gameID of similarGames) {
		console.log(`checking gameID: ${gameID} in backlog`)
		let considered = false
		// check if potential recommended game is in user's backlog
		for (const backlogGameId of backlog) {
			if (gameID === backlogGameId) {
				considered = true
				break
			}
		}
		if (considered) continue
		console.log(`checking gameID: ${gameID} in reviews`)
		// check if potential recommended game has not been reviewed yet by the user
		for (const reviewId of reviews) {
			const reviewSnap = await db.collection("reviews").doc(reviewId).get()
			if (gameID === reviewSnap.data().gameId) {
				considered = true
				break
			}
		}
		if (considered) continue

		// this game has not been considered yet by the user, add it to recommended
		if (gameID in recommended) recommended[gameID] += 1
		else recommended[gameID] = 1
	}

	// if game just reviewed was recommended before, delete it
	if (reviewedGame in recommended) delete recommended[reviewedGame]

	var userRef = db.collection("users").doc(userID)
	userRef.update({
		recommended: recommended
	})

	let recommendedGames = []
	for (const [gameId, value] of Object.entries(recommended)) {
		recommendedGames.push([gameId, value])
	}

	// update topRecommended games for user to appear in Home page
	const sortedRecommendedGames = recommendedGames.sort((a, b) => a[1] - b[1]).reverse()
	const arrRecommendedGames = sortedRecommendedGames.map((entry) => entry[0])
	userRef.update({
		topRecommended: arrRecommendedGames
	})
})

exports.removeGamesFromRecommended = functions.https.onCall(async (data, context) => {
	const reviewedGame = data.reviewedGame
	const similarGames = data.similarGames
	const userID = context.auth.uid
	console.log(`similar games: ${similarGames}`)
	const userSnap = await db.collection("users").doc(userID).get()
	const recommended = userSnap.data().recommended

	// remove/decrement similar games from recommended
	for (const gameID of similarGames) {
		if (gameID in recommended) {
			recommended[gameID] -= 1
			if (recommended[gameID] < 1) delete recommended[gameID]
		}
	}

	var userRef = db.collection("users").doc(userID)
	userRef.update({
		recommended: recommended
	})

	let recommendedGames = []
	for (const [gameId, value] of Object.entries(recommended)) {
		recommendedGames.push([gameId, value])
	}

	// update topRecommended games for user to appear in Home page
	const sortedRecommendedGames = recommendedGames.sort((a, b) => a[1] - b[1]).reverse()
	const arrRecommendedGames = sortedRecommendedGames.map((entry) => entry[0])
	userRef.update({
		topRecommended: arrRecommendedGames
	})
})

// deletes a Leaderboard user and all its past content
exports.deleteAccount = functions.https.onCall(async (data, context) => {
	const userId = context.auth.uid
	const userDocsPromises = [
		db.collection("reviews").where("userId", "==", userId).get(),
		db.collection("lists").where("userId", "==", userId).get(),
		db.collection("tierlists").where("userId", "==", userId).get(),
		db.collection("comments").where("userId", "==", userId).get()
	]

	// get all reviews, lists, tierlists and comments to check for user's data
	const [reviewsSnap, listsSnap, tierlistsSnap, commentsSnap] = await Promise.all(userDocsPromises)

	const gameSpecificReviewsBatch = db.batch()

	// Remove reviews' IDs from the gameSpecificReviews collection
	const reviewIdsToRemove = reviewsSnap.docs.map((reviewDoc) => reviewDoc.id)
	const uniqueGameIds = Array.from(new Set(reviewsSnap.docs.map((reviewDoc) => reviewDoc.data().gameId)))

	const removeReviewsFromGameSpecificReviews = async (gameId, reviewIds) => {
		if (reviewIds.length === 0) return
		const gameSpecificReviewDocRef = db.collection("gameSpecificReviews").doc(gameId)
		const gameSpecificReviewDoc = await gameSpecificReviewDocRef.get()

		// recompute a game's rating if deleting user reviewed it
		if (gameSpecificReviewDoc.exists) {
			const reviews = await gameSpecificReviewDoc.get("reviews")
			if (reviews.length === 1) {
				gameSpecificReviewsBatch.delete(db.collection("gameSpecificReviews").doc(gameId))
			} else {
				// recompute gameSpecific's rating
				let ratings = { 0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0 }
				let reviewSum = 0
				let reviewCount = 0
				for await (const reviewId of reviews) {
					if (reviewIds.includes(reviewId)) {
						continue
					}
					reviewCount += 1
					const reviewSnap = await db.collection("reviews").doc(reviewId).get()
					const currentRating = await reviewSnap.get("rating")
					ratings[currentRating] += 1
					reviewSum += currentRating
				}
				gameSpecificReviewsBatch.update(gameSpecificReviewDocRef, {
					reviews: FieldValue.arrayRemove(...reviewIds),
					globalRating: reviewSum / reviewCount,
					ratings: ratings
				})
			}
		}
	}

	const removeReviewPromises = uniqueGameIds.map((gameId) => {
		const reviewIdsForGame = reviewIdsToRemove.filter((reviewId) => {
			const reviewDoc = reviewsSnap.docs.find((doc) => doc.id === reviewId)
			return reviewDoc.data().gameId === gameId
		})
		return removeReviewsFromGameSpecificReviews(gameId, reviewIdsForGame)
	})
	await Promise.all(removeReviewPromises)
	await gameSpecificReviewsBatch.commit()
	console.log(`Deleted reviews from GameSpecificReviews`)

	const batchDelete = db.batch()

	const deleteDocs = (snap) => {
		snap.forEach((doc) => {
			batchDelete.delete(doc.ref)
		})
	}

	deleteDocs(reviewsSnap)
	deleteDocs(listsSnap)
	deleteDocs(tierlistsSnap)
	deleteDocs(commentsSnap)

	await batchDelete.commit()

	const batchUpdate = db.batch()

	// Remove user upvotes, downvotes, and comment IDs from other users' documents
	const allCollections = ["reviews", "lists", "tierlists", "comments"]
	const removeUserVotesPromises = allCollections.map(async (collectionName) => {
		const snap = await db.collection(collectionName).get()

		snap.forEach((doc) => {
			batchUpdate.update(doc.ref, {
				upvotes: FieldValue.arrayRemove(userId),
				downvotes: FieldValue.arrayRemove(userId)
			})

			if (collectionName !== "comments") {
				const userCommentIds = commentsSnap.docs.map((commentDoc) => commentDoc.id)
				if (userCommentIds.length) {
					batchUpdate.update(doc.ref, {
						comments: FieldValue.arrayRemove(...userCommentIds)
					})
				}
			}
		})
		console.log(`Deleted from collection ${collectionName}, including comments and votes`)
	})

	await Promise.all(removeUserVotesPromises)

	// Remove user ID from other users' following and followers arrays
	const usersSnap = await db.collection("users").get()
	usersSnap.forEach((userDoc) => {
		batchUpdate.update(userDoc.ref, {
			following: FieldValue.arrayRemove(userId),
			followers: FieldValue.arrayRemove(userId)
		})
	})
	console.log(`Deleted from followers/following`)

	await batchUpdate.commit()

	// Remove user from users collection and Firebase Authentication
	const userDocRef = db.collection("users").doc(userId)
	await userDocRef.delete()
	await admin.auth().deleteUser(userId)

	console.log(`User ${userId} and associated data deleted.`)
})
