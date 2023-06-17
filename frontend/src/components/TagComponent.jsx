
/*
The tag component. To be displayed in WriteReviewComponent, and display review components.

This contains the text of a tag.

*/
import { Button, createTheme, ThemeProvider, Typography } from "@mui/material"
import { Box } from "@mui/system"

const theme = createTheme({
	typography: {
		fontFamily: "Josefin Sans"
	}
})

function TagComponent(props) {
	return (
		<>
			<Box data-testid="tag-test"
				textAlign="center"
				sx={{
					width: props.tagWidth,
					bgcolor: "#4C2F97",
					borderRadius: 3
				}}>
				<ThemeProvider theme={theme}>
					<Typography color="#FFFFFF" align="center">
						{props.text}
					</Typography>
				</ThemeProvider>
			</Box>
		</>
	)
}

export default TagComponent
