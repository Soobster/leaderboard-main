import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthContextProvider } from "./context/AuthContext"
import HomePage from "./pages/HomePage"
import ProfilePage from "./pages/ProfilePage"
import BacklogPage from "./pages/BacklogPage"
import SettingsPage from "./pages/SettingsPage"
import GamePage from "./pages/GamePage"
import ListsPage from "./pages/ListsPage"
import SearchPage from "./pages/SearchPage"
import NotFoundPage from "./pages/NotFoundPage"
import TrendingPage from "./pages/TrendingPage"
import RecommendedPage from "./pages/RecommendedPage"
import AuthenticationPage from "./pages/AuthenticationPage"
import CreateUserPage from "./pages/CreateUserPage"
import PrivateRoute from "./components/PrivateRoute"
import TierListPage from "./pages/lists/TierListPage"
import ListPage from "./pages/lists/ListPage"
import GamesReviewedPage from "./pages/GamesReviewedPage"
import AboutUsPage from "./pages/AboutUsPage"
import ViewListPage from "./pages/lists/ViewListPage"
import ViewTierListPage from "./pages/lists/ViewTierListPage"
import FAQPage from "./pages/FAQPage"

function App() {
	return (
		<AuthContextProvider>
			<BrowserRouter>
				<Routes>
					{/* Routes that require no authentication */}
					<Route index path="/" element={<HomePage />} />
					<Route path="/auth" element={<AuthenticationPage />} />
					<Route path="/aboutus" element={<AboutUsPage />} />
					<Route path="/FAQ" element={<FAQPage />} />
					{/* Protected routes that require authentication */}
					<Route path="/search/:searchTerm" element={<PrivateRoute />}>
						<Route path="/search/:searchTerm" element={<SearchPage />} />
					</Route>
					<Route path="/game/:gameID" element={<PrivateRoute />}>
						<Route path="/game/:gameID" element={<GamePage />} />
					</Route>
					<Route path="/create" element={<PrivateRoute />}>
						<Route path="/create" element={<CreateUserPage />} />
					</Route>
					<Route path="/settings" element={<PrivateRoute />}>
						<Route path="/settings" element={<SettingsPage />} />
					</Route>
					<Route path="/:username" element={<PrivateRoute />}>
						<Route path="/:username" element={<ProfilePage />} />
					</Route>
					<Route path="/trending" element={<PrivateRoute />}>
						<Route path="/trending" element={<TrendingPage />} />
					</Route>
					<Route path="/recommended" element={<PrivateRoute />}>
						<Route path="/recommended" element={<RecommendedPage />} />
					</Route>
					<Route path="/:username/backlog" element={<PrivateRoute />}>
						<Route path="/:username/backlog" element={<BacklogPage />} />
					</Route>
					<Route path="/:username/lists" element={<PrivateRoute />}>
						<Route path="/:username/lists" element={<ListsPage />} />
					</Route>
					<Route path="/recommended" element={<PrivateRoute />}>
						<Route path="/recommended" element={<RecommendedPage />} />
					</Route>
					{/* Lists routes start */}
					{/* Tierlist routes */}
					<Route path="/:username/tierlist/:gameID" element={<PrivateRoute />}>
						<Route path="/:username/tierlist/:gameID" element={<TierListPage />} />
					</Route>
					<Route path="/:username/tierlist" element={<PrivateRoute />}>
						<Route path="/:username/tierlist" element={<TierListPage />} />
					</Route>
					<Route path="/:username/tierlist/view/:listID" element={<PrivateRoute />}>
						<Route path="/:username/tierlist/view/:listID" element={<ViewTierListPage />} />
					</Route>
					<Route path="/:username/tierlist/edit/:listID" element={<PrivateRoute />}>
						<Route path="/:username/tierlist/edit/:listID" element={<TierListPage />} />
					</Route>
					{/* List routes */}
					<Route path="/:username/list/:gameID" element={<PrivateRoute />}>
						<Route path="/:username/list/:gameID" element={<ListPage />} />
					</Route>
					<Route path="/:username/list" element={<PrivateRoute />}>
						<Route path="/:username/list" element={<ListPage />} />
					</Route>
					<Route path="/:username/list/view/:listID" element={<PrivateRoute />}>
						<Route path="/:username/list/view/:listID" element={<ViewListPage />} />
					</Route>
					<Route path="/:username/list/edit/:listID" element={<PrivateRoute />}>
						<Route path="/:username/list/edit/:listID" element={<ListPage />} />
					</Route>
					{/* Lists routes end */}
					<Route path="/:username/gamesreviewed" element={<PrivateRoute />}>
						<Route path="/:username/gamesreviewed" element={<GamesReviewedPage />} />
					</Route>
					<Route path="/notfound" element={<PrivateRoute />}>
						<Route path="/notfound" element={<NotFoundPage />} />
					</Route>
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			</BrowserRouter>
		</AuthContextProvider>
	)
}

export default App
