/*
The PrivateRoute component. It is used to manage users in the website depending on if they are logged in.

If they are logged in, this component will return its children component. If not, then they will be redirected
to the '/auth' route.
*/

import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { UserAuth } from "../context/AuthContext"

function PrivateRoute() {
	const { currentUser } = UserAuth()
	// if user is logged in: go to children element
	// otherwise go to 'auth' route
	return currentUser ? <Outlet /> : <Navigate to="/auth" />
}

export default PrivateRoute
