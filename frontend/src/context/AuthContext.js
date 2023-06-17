import { useContext, createContext, useEffect } from "react"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { useState } from "react"

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState()
	const [loading, setLoading] = useState(true)
	const auth = getAuth()

	const googleSignIn = () => {
		const provider = new GoogleAuthProvider()
		signInWithPopup(auth, provider)
	}

	const logout = () => {
		signOut(auth)
	}

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setCurrentUser(user)
			setLoading(false)
		})

		return unsubscribe
	}, [])

	return <AuthContext.Provider value={{ googleSignIn, logout, auth, currentUser }}>{!loading && children}</AuthContext.Provider>
}

export const UserAuth = () => {
	return useContext(AuthContext)
}
