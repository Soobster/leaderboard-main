/*
The Spinner component. To be displayed in an individual component.

This represents that data for the component is loading.
*/

import { React } from "react"
import PulseLoader from "react-spinners/PulseLoader"

function SpinnerComponent({ override, size = 20 }) {
	return <PulseLoader color="#fff" loading={true} size={size} cssOverride={override} />
}

export default SpinnerComponent
