/*
The AddGameToListComponent. A dialog box that appears when the user clicks on "Add game to list" from
any game page. This allows users to add the game they are currently viewing to either a new list or
a new tier list. 

When a selection is chosen, relevant game data is sent to the appropriate component and the user
is redirected to the list/tier list creation page.
*/

import * as React from "react"
import PropTypes from "prop-types"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import DialogTitle from "@mui/material/DialogTitle"
import Dialog from "@mui/material/Dialog"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import { useNavigate, useParams } from "react-router-dom"
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Grid } from "@mui/material"

function AddGameToListComponent({ username }) {
	const navigate = useNavigate()
	const { gameID } = useParams()
	const listOptions = ["Add to new Tier List", "Add to new List"]

	function SimpleDialog(props) {
		const { onClose, selectedValue, open } = props

		const handleClose = () => {
			onClose(selectedValue)
		}

		const handleListItemClick = (value) => {
			onClose(value)
		}

		return (
			<Dialog onClose={handleClose} open={open} borderRadius={2}>
				<DialogTitle sx={{ background: "#494949", color:"#fff" }}>Add to Tier List / List</DialogTitle>
				<Divider sx={{borderBottomWidth: 2, color: "#4C2F97" }} />
				<List sx={{ pt: 0 ,background:"#494949" }}>
					{listOptions.map((option) => (
						<ListItem disableGutters key={option}>
							<Box
								sx={{
									ml: 1,
									mr: 1,
									width: "100%",
									maxHeight: 55,
									background: "linear-gradient(#4f319b,#362269)",
									borderRadius: 3
								}}>
								<ListItemButton autoFocus onClick={() => handleListItemClick({ option })}>
									<FormatListBulletedIcon style={{ color: "FFFFFF" }} />
									<span>&nbsp;&nbsp;&nbsp;</span>
									<ListItemText sx={{ color: "#FFFFFF" }} primary={option} />
								</ListItemButton>
							</Box>
						</ListItem>
					))}
				</List>
			</Dialog>
		)
	}

	SimpleDialog.propTypes = {
		onClose: PropTypes.func.isRequired,
		open: PropTypes.bool.isRequired,
		selectedValue: PropTypes.string.isRequired
	}

	const [open, setOpen] = React.useState(false)
	const [selectedValue, setSelectedValue] = React.useState(listOptions[1])

	const handleClickOpen = () => {
		setOpen(true)
	}

	const handleClose = (value) => {
		setOpen(false)
		setSelectedValue(value)
		if (value.option === "Add to new Tier List") {
			navigate(`/${username}/tierlist/${gameID}`)
		} else if (value.option === "Add to new List") {
			navigate(`/${username}/list/${gameID}`)
		}
	}

	return (
		<Grid item xs={12} align="center">
			<Button sx={{ textTransform: "none", color: "#FFFFFF" }} onClick={handleClickOpen}>
				<FormatListBulletedIcon />
				<span>&nbsp;&nbsp;</span>
				<Typography align="center">Add to List...</Typography>
			</Button>
			<SimpleDialog selectedValue={selectedValue} open={open} onClose={handleClose} />
		</Grid>
	)
}

export default AddGameToListComponent
