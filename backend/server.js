const express = require("express")
const app = express()
const axios = require("axios")
require("dotenv").config({ path: "./.env" })

// GET request which send a POST request with a query to IGDB and
// returns the result in a JSON object
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

app.listen(process.env.PORT || 3005, () => {
	console.log("server started on port 3005")
})

// **example to fall back on to
// app.get("/api", (req, res) => {
// 	res.json({ "users": ["userOne", "userTwo", "userThree"] })
// })
