/*
The DraggableListComponent. This component is used in conjunction with the
react-beautiful-dnd (drag 'n drop) library to allow users the ability to create lists
and tier lists.

When used in list creation, the user can reorder game covers and delete games from the list

When used in tier list creation, the user ccan reorder game covers in individual rows and
drag game covers to different rows. Games can be deleted by clicking the trash icon at the
bottom left of the cover image.

*/
import { Box, Typography, ThemeProvider, createTheme } from "@mui/material"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import DeleteIcon from "@mui/icons-material/Delete"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function DraggableListComponent(props) {
	const rows = props.rows

	const grid = 12

	const getItemStyle = (isDragging, draggableStyle) => ({
		// some basic styles to make the items look a bit nicer
		userSelect: "none",
		//padding: grid * 2,
		margin: `0 ${grid}px 0 0`,

		// styles we need to apply on draggables
		...draggableStyle
	})

	const getListStyle = (isDraggingOver, itemsLength) => ({
		display: "flex",
		//width: itemsLength * 100 + 150
		//width: 5 * 100 + 150

		background: isDraggingOver ? "lightblue" : "lightgrey",
		padding: 1,
		width: "auto",
		minWidth: 100,
		height: 110
	})

	return (
		<>
			<DragDropContext onDragEnd={(result) => props.onDragEnd && props.onDragEnd(result)}>
				{Object.entries(rows).map(([rowID, row], index) => {
					return (
						<Box
							sx={{
								ml: 1,
								mr: 1,
								display: "flex",
								alignItems: "center",
								flexDirection: "vertical",
								direction: "horizontal"
							}}
							key={rowID}>
							{rowID !== "0" ? (
								<>
									{/* tier title */}
									<Box
										bgcolor={row.color}
										height={145}
										sx={{
											ml: 1,
											mr: 1,
											display: "flex",
											width: 140,
											alignItems: "center",
											boxShadow: 5,
											textOverflow: "ellipsis",
											wordWrap: "break-word",
											overflowWrap: "anywhere",
											"&:hover": {
												cursor: "pointer",
												opacity: 0.88
											}
										}}
										onClick={() => props.handleTierClick(index)}>
										<ThemeProvider theme={theme}>
											<Typography fontSize={"32px"} sx={{ flexGrow: 1, ml: 1, mr: 1 }}>
												{row.name}
											</Typography>
										</ThemeProvider>
									</Box>
								</>
							) : (
								<>
									{/* {props.regularList &&
										(<Box
											height={120}
											
											sx={{
												display: "flex",
												width: 120,
												overflow: "hidden",
												overflowX: "scroll",
												wordWrap: "break-word",
												flexWrap: "wrap",
												overflowWrap: "break-word"
											}}>
											<ThemeProvider theme={theme}>
												<Typography fontSize={"32px"} color="#FFF" sx={{ flexGrow: 1 }}>
													{row.name}
												</Typography>
											</ThemeProvider>
										</Box>)
									} */}
								</>
							)}

							{rowID == "0" ? (
								<>
									{/* bank */}
									<Box style={{ margin: 8, overflow: "hidden", overflowX: "scroll", backgroundColor: "#d3d3d3" }}>
										{/* game covers */}

										<Droppable droppableId={rowID.toString()} key={rowID} direction="horizontal">
											{(provided, snapshot) => {
												return (
													<Box
														{...provided.droppableProps}
														ref={provided.innerRef}
														sx={getListStyle(snapshot.isDraggingOver, row.items.length)}>
														{row.items.map((game, index) => {
															return (
																<Draggable key={game.gameID} draggableId={game.gameID.toString()} index={index}>
																	{(provided, snapshot) => {
																		return (
																			<Box
																				ref={provided.innerRef}
																				{...provided.draggableProps}
																				{...provided.dragHandleProps}
																				sx={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
																				<DeleteIcon
																					sx={{
																						position: "relative",
																						mr: -3,
																						color: "#BA020E",
																						mt: -6,
																						"&:hover": { cursor: "pointer", color: "#E30000" }
																					}}
																					onClick={() => {
																						props.removeGame(game.gameID, rowID)
																					}}
																				/>
																				<Box
																					component="img"
																					width={75}
																					height={110}
																					sx={{
																						backgroundColor: "#fff",
																						borderRadius: 3
																					}}
																					src={game.cover}></Box>
																			</Box>
																		)
																	}}
																</Draggable>
															)
														})}
														{provided.placeholder}
													</Box>
												)
											}}
										</Droppable>
									</Box>
								</>
							) : (
								<Box style={{ margin: 8, overflow: "hidden", overflowX: "scroll", backgroundColor: "#d3d3d3" }}>
									{/* game covers */}
									<Droppable droppableId={rowID.toString()} key={rowID} direction="horizontal">
										{(provided, snapshot) => {
											return (
												<Box
													{...provided.droppableProps}
													ref={provided.innerRef}
													sx={getListStyle(snapshot.isDraggingOver, row.items.length)}>
													{row.items.map((game, index) => {
														return (
															<Draggable key={game.gameID} draggableId={game.gameID.toString()} index={index}>
																{(provided, snapshot) => {
																	return (
																		<Box
																			ref={provided.innerRef}
																			{...provided.draggableProps}
																			{...provided.dragHandleProps}
																			sx={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
																			<DeleteIcon
																				sx={{
																					position: "relative",
																					mr: -3,
																					color: "#BA020E",
																					mt: -6,
																					"&:hover": { cursor: "pointer", color: "#E30000" },
																					backgroundColor: "#000",
																					borderRadius: 2
																				}}
																				onClick={() => {
																					props.removeGame(game.gameID, rowID)
																				}}
																			/>
																			<Box
																				component="img"
																				width={75}
																				height={110}
																				sx={{
																					backgroundColor: "#fff",
																					borderRadius: 3
																				}}
																				src={game.cover}></Box>
																		</Box>
																	)
																}}
															</Draggable>
														)
													})}
													{provided.placeholder}
												</Box>
											)
										}}
									</Droppable>
								</Box>
							)}
						</Box>
					)
				})}
			</DragDropContext>
		</>
	)
}

export default DraggableListComponent
