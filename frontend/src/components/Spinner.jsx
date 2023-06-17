/*
The Spinner component. To be displayed in the entire screen at the center.

This represents that an entire page is loading.

*/

import { React } from "react"
import PulseLoader from "react-spinners/PulseLoader"

// css to make spinner be centered in page
const override = {
	position: "absolute",
	top: "50%",
	left: "50%",
	marginTop: "-50px",
	marginLeft: "-30px"
}

function Spinner() {
	return <PulseLoader color="#fff" loading={true} size={20} cssOverride={override} />
}

export default Spinner
