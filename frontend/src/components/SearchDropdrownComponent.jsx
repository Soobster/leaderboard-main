/*
The SearchContainerComponent. Displays the results of a search as a dropdown list.

This component is used in the settings page, create user page and lists creation page.
*/

import { useEffect, useState, Fragment } from "react"
import { Autocomplete, TextField } from "@mui/material"
import CircularProgress from "@mui/material/CircularProgress"
import { checkGameCacheBySearchTerm } from "../helperFunctions/checkGameCache"

export default function AddToBankv2({ handleAddGameToBank, handleFavGameChange, defaultValue, setDefaultValue }) {
	const [open, setOpen] = useState(false)
	const controller = new AbortController()
	const [results, setResults] = useState(defaultValue ? [defaultValue] : [])
	const [loading, setLoading] = useState(open && results.length === 0)
	let searchTimeoutId
	let { searchTerm } = ""

	// sets loading to false if there are results
	useEffect(() => {
		setLoading(false)
	}, [results])

	// sets a timeout of 2s if the user searched a term
	const handleKeyUp = (e) => {
		if (searchTimeoutId) {
			clearTimeout(searchTimeoutId)
		}
		setLoading(true)
		if (e.target.value !== "" && e.target.value !== "Enter") {
			searchTerm = e.target.value
			searchTimeoutId = setTimeout(() => {
				fetchSearchResults(searchTerm)
			}, 2000)
		}
	}

	// makes a selection based on what component this dropdown is being used at
	async function madeSelection(e, value) {
		if (handleAddGameToBank) {
			handleAddGameToBank(value)
		}
		if (handleFavGameChange) {
			handleFavGameChange(value ? value : "")
		}
	}

	// fetches search results based on a search term and populated it in the dropdown
	const fetchSearchResults = async (searchTerm) => {
		const fetchedData = await checkGameCacheBySearchTerm(searchTerm)
		let tempArr = []

		if (fetchedData.length !== 0) {
			for (let i = 0; i < fetchedData.length; i++) {
				if (fetchedData[i].release_dates[0] && fetchedData[i].release_dates[0].y) {
					tempArr.push({
						label: fetchedData[i].name.toString() + " (" + fetchedData[i].release_dates[0].y.toString() + ")",
						id: fetchedData[i].id,
						name: fetchedData[i].name,
						year: fetchedData[i].release_dates,
						cover: fetchedData[i].cover.url.replace("t_thumb", "t_1080p")
					})
				}
			}
			setResults(tempArr)
		}
		setLoading(false)
		return () => controller.abort()
	}

	return (
		<>
			<Autocomplete
				sx={{ width: "270px", backgroundColor: "#FFF", borderRadius: 1 }}
				open={open}
				onOpen={() => {
					setOpen(true)
				}}
				onClose={() => {
					setLoading(false)
					setOpen(false)
				}}
				value={defaultValue ? results[0] : null}
				clearOnBlur={false}
				noOptionsText={"No Results"}
				isOptionEqualToValue={(option, value) => option.title === value.title}
				getOptionLabel={(option) => option.label}
				options={results}
				loading={loading}
				onInputChange={(e) => {
					if (e !== null) {
						if (defaultValue) setDefaultValue(null)
						handleKeyUp(e)
					}
				}}
				onChange={madeSelection}
				renderInput={(params) => (
					<TextField
						{...params}
						InputProps={{
							...params.InputProps,
							endAdornment: (
								<Fragment>
									{loading ? <CircularProgress color="inherit" size={20} /> : null}
									{params.InputProps.endAdornment}
								</Fragment>
							)
						}}
					/>
				)}
			/>
		</>
	)
}
