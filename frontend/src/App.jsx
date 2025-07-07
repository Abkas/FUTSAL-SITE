import {Route, Routes ,Navigate} from "react-router-dom"

import HomePage from "./pages/HomePage"
import Linkprofile from "./pages/Player-profile/Linkprofile"
import SignUpPage from "./pages/SignUpPage"
import LogInPage from "./pages/LogInPage"
import AboutUsPage from "./pages/AboutUsPage"
import HowItWorks from "./pages/HowItWorksPage"
import ScrollToTop from "./components/ScrollToTop"

import PDashboardPage from "./pages/Player-profile/PDashboardPage"
import PAddFriend from "./pages/Player-profile/PAddFriend"
import PHistoryPage from "./pages/Player-profile/PHistoryPage"

import PUpcomingMatches from "./pages/Player-profile/PUpcomingMatchesPage"

import FutsalHome from "./pages/FutsalHome"
import QuickFindFutsalPage from "./pages/QuickFindFutsalPage"
import TournamentPage from "./pages/TournamentPage"
import BookFutsal from "./pages/BookFutsal"

import FutsalDetails from './pages/FutsalDetails'

import PlayerUpdateProfile from "./pages/Player-profile/PlayerUpdateProfile"

import ODashboard from "./pages/organizer-profile/ODashbaord"
import OAddFriend from "./pages/organizer-profile/OAddFriend"
import OHistory from "./pages/organizer-profile/OHistory"
import OMyFutsal from "./pages/organizer-profile/OMyFutsal"
import OSlotsPage from "./pages/organizer-profile/OSlotsPage"

import UpdateFutsal from "./components/updatefutsal"
import OrganizerProfile from "./pages/organizer-profile/OrganizerProfile"
import OrganizerUpdateProfile from "./pages/organizer-profile/OrganizerUpdateProfile"
import PlayerProfile from "./pages/Player-profile/PlayerProfile"
import MyTeamPage from "./pages/Player-profile/MyTeamPage"

import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"

import {Loader} from "lucide-react"

import { Toaster } from "react-hot-toast"
import MapSearchPage from './pages/MapSearchPage';
import './pages/MapSearchPage.css';

const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore()


  useEffect(() => {
    checkAuth()
  },
   [checkAuth])

  console.log({authUser})

  if(isCheckingAuth && !authUser  )
    return (<div className="flex items-center justify-center h-screen">
      <Loader className='size-10 animate-spin' />
    </div>)
  
  return (
    <div>
        <ScrollToTop />
      <Routes>
        <Route path = '/'  element={<HomePage />} />
        <Route path = '/about-us'  element={<AboutUsPage />} />
        <Route path = '/how-it-works'  element={<HowItWorks />} />
        <Route path = '/signup'  element= { !authUser? <SignUpPage />: <Navigate to = '/'/>}/>
        <Route path = '/login'  element= {!authUser?<LogInPage />: <Navigate to = '/'/>} />


        <Route path = '/player-dashboard'  element= {authUser?<PDashboardPage />: <Navigate to='/login'/>} />
        <Route path = '/player-addfriend'  element= {authUser?<PAddFriend />: <Navigate to='/login'/>} />
        <Route path = '/player-history'  element= {authUser?<PHistoryPage />: <Navigate to='/login'/>} />
        <Route path = '/player-upcomingmatches'  element= {authUser?<PUpcomingMatches />: <Navigate to='/login'/>} />

        <Route path = '/futsalhome' element= {authUser?<FutsalHome />: <Navigate to='/login'/>} />
        <Route path = '/quickmatch' element= {authUser?<QuickFindFutsalPage />: <Navigate to='/login'/>} />
        <Route path = '/tournaments' element= {authUser?<TournamentPage />: <Navigate to='/login'/>} />
        <Route path = '/bookfutsal' element= {authUser?<BookFutsal />: <Navigate to='/login'/>} />

        <Route path="/futsal/:id" element={authUser?<FutsalDetails />:<Navigate to = '/login'/>} />
      
        <Route path = '/update-profile' element= {authUser?<PlayerUpdateProfile />: <Navigate to='/login'/>} />
        <Route path = '/organizer-dashboard' element= {authUser?<ODashboard />: <Navigate to='/login'/>} />
        <Route path = '/organizer-addfriend' element= {authUser?<OAddFriend />: <Navigate to='/login'/>} />
        <Route path = '/organizer-history' element= {authUser?<OHistory />: <Navigate to='/login'/>} />
        <Route path = '/organizer-futsals' element= {authUser?<OMyFutsal />: <Navigate to='/login'/>} />
        <Route path = '/organizer-slots' element= {authUser?<OSlotsPage />: <Navigate to='/login'/>} />
        <Route path = '/update-futsal' element= {authUser?<UpdateFutsal />: <Navigate to='/login'/>} />
        
        {/* Player Profile Routes */}
        <Route path="/player-profile" element={authUser ? <PlayerProfile /> : <Navigate to="/login" />} />
        <Route path="/player-profile/:id" element={authUser ? <PlayerProfile /> : <Navigate to="/login" />} />
        <Route path="/player-update-profile" element={authUser ? <PlayerUpdateProfile /> : <Navigate to="/login" />} />
        <Route path="/player-myteam" element={authUser ? <MyTeamPage /> : <Navigate to="/login" />} />
        
        {/* Organizer Profile Routes */}
        <Route path="/organizer-profile/:id" element={authUser ? <OrganizerProfile /> : <Navigate to="/login" />} />
        <Route path="/organizer-update-profile" element={authUser ? <OrganizerUpdateProfile /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <Linkprofile /> : <Navigate to="/login" />} />
        <Route path="/map-search" element= {authUser?<MapSearchPage />: <Navigate to='/login'/>} />
      </Routes>

      <Toaster />




    </div>
  )
}



export default App