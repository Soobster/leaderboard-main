/*
The SelectTagsComponent, this is used whenever the user wants to select tags from a list.

props.handleTagsSelected as a callback will allow you to do something with the tags selected

props.tags lets you select the tags from a dropdown

props.val lets you populate the selection box with outside tags already selected
*/

import { ClearRounded } from "@mui/icons-material"
import { Autocomplete, Chip, TextField } from "@mui/material"

function SelectTagsComponent(props) {
	// handles selection of tag selected
	async function madeSelection(e, value) {
		if (props.handleTagsSelected) {
			props.handleTagsSelected(value)
		}
	}

	return (
		<Autocomplete
			sx={{
				mt: 1,
				width: 300,
				color: "white",
				".MuiOutlinedInput-notchedOutline": {
					borderColor: "#FFF"
				},
				"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
					borderColor: "#FFF"
				},
				"&:hover .MuiOutlinedInput-notchedOutline": {
					borderColor: "#FFF"
				},
				".MuiSvgIcon-root ": {
					fill: "white !important"
				}
			}}
			disableCloseOnSelect
			value={props.val}
			multiple
			onChange={madeSelection}
			id="tags-filled"
			options={props.tags.map((option) => option)}
			freeSolo
			renderTags={(value, getTagProps) =>
				value.map((option, index) => (
					<Chip
						variant="outlined"
						label={option}
						{...getTagProps({ index })}
						sx={{ bgcolor: "#4C2F97", color: "#FFF" }}
						deleteIcon={<ClearRounded sx={{ fill: "white" }} />}
					/>
				))
			}
			renderInput={(params) => <TextField {...params} />}
		/>
	)
}

export default SelectTagsComponent
