/*
The DraggableGameCoverComponent. Unused, originally meant to be the draggable component used in List
and Tier List creation.

*/
import React from "react"
import { Box, Grid } from "@mui/material"
import { useEffect, useState } from "react"


function DraggableGameCoverComponent({ gameData }) {

	const [gameID, setGameID] = useState("")
	const [gameCover, setGameCover] = useState("")
	const [gameTitle, setGameTitle] = useState("")


	useEffect(() => {
		// console.log("Starting data retrieval")
		// console.log("Retrieved data: " + gameData)
		setGameID(gameData.id) //props.gameData[i].id (for array)
		setGameTitle(gameData.name)
		setGameCover(gameData.cover)
	}, [])

	return (
		<div>
			<Grid container rowSpacing={2} sx={{ width: "auto" }}>
				<Grid item xs={1.5} align={"left"} sx={{ ml: 1 }}>
					<Box
						component="img"
						width={100}
						height={150}
						sx={{
							backgroundColor: "#fff",
							borderRadius: 3
						}}
						src={gameCover}>

					</Box>
				</Grid>
			</Grid>
		</div>
	)
}

export default DraggableGameCoverComponent
