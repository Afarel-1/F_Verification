// ======================================================
// APP.JSX
// ======================================================

import { Routes, Route } from "react-router-dom"

import SplashScreen from "./pages/SplashScreen"
import AuthPage from "./pages/AuthPage"
import Home from "./pages/Home"
import Verify from "./pages/Verify"
import Certificate from "./pages/Certificate"
import RequestCertificate from "./pages/RequestCertificate"
import WebcamCapture from "./pages/WebcamCapture"
import AdminDashboard from "./pages/AdminDashboard"
import AdminLogin from "./pages/AdminLogin"
import Messages from "./pages/Messages"
import Profile from "./pages/Profile"

import "./App.css"

function App() {

  return (

    <Routes>

      {/* SPLASH SCREEN */}
      <Route
        path="/"
        element={<SplashScreen />}
      />

      {/* AUTH */}
      <Route
        path="/auth"
        element={<AuthPage />}
      />

      {/* WEBCAM */}
      <Route
        path="/webcam"
        element={<WebcamCapture />}
      />

      {/* HOME */}
      <Route
        path="/home"
        element={<Home />}
      />

      {/* VERIFY */}
      <Route
        path="/verify"
        element={<Verify />}
      />

      {/* CERTIFICATE */}
      <Route
        path="/certificate"
        element={<Certificate />}
      />

      {/* REQUEST CERT */}
      <Route
        path="/request-certificate"
        element={<RequestCertificate />}
      />
      

      {/* ADMINISTRATOR */}
      <Route
        path="/admin-login"
        element={<AdminLogin />}
      />

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />

      {/* MESSAGES*/}
      <Route
        path="/messages"
        element={<Messages />}
      />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={<Profile />}
      />

    </Routes>
  )
}

export default App
