import { Route, Routes, Navigate } from "react-router-dom"

import HomePage from "./pages/HomePage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import SignUpPage from "./pages/SignUpPage.jsx"
import OnboardingPage from "./pages/OnboardingPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import CallPage from "./pages/CallPage.jsx"
import NotificationsPage from "./pages/NotificationsPage.jsx"
import FriendsPage from "./pages/FriendsPage.jsx"
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx"
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx"
import { Toaster } from "react-hot-toast"
import PageLoader from "./components/PageLoader.js"
import useAuthUser from "./hooks/useAuthUser.js"
import Layout from "./components/Layout.jsx"
import { useThemeStore } from "./store/useThemeStore.js"
import VerifyEmailPage from './pages/VerifyEmailPage'

const App = () => {

const {isLoading, authUser} = useAuthUser();
const {theme} = useThemeStore();
const isAuthenticated = Boolean(authUser);
const isOnboarded = authUser?.isOnboarded;

if(isLoading) return <PageLoader/>
  return (
    <div className="h-screen" data-theme={theme}> 
      
      <Routes>
        <Route path="/" element={isAuthenticated && isOnboarded?(
          <Layout showSidebar={true}>
            <HomePage />
          </Layout>
        ):(
          <Navigate to={!isAuthenticated?"/login" : "/onboarding"}/>
        )} />
        <Route path="/signup" element={!isAuthenticated? <SignUpPage />:<Navigate to={isOnboarded?"/":"/onboarding"}/>} />
        <Route path="/login" element={!isAuthenticated? <LoginPage />:<Navigate to={isOnboarded?"/":"/onboarding"}/>} />
        <Route path="/forgot-password" element={!isAuthenticated? <ForgotPasswordPage />:<Navigate to="/"/>} />
        <Route path="/reset-password/:token" element={!isAuthenticated? <ResetPasswordPage />:<Navigate to="/"/>} />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />        
        <Route
          path="/friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />        
  <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route path="/onboarding" element={isAuthenticated?(
          <OnboardingPage />
        ):(
          <Navigate to="/login"/>
        )} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App
