import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Register from "./pages/Register"
import WebcamCapture from "./pages/WebcamCapture"
import Certificate from "./pages/Certificate"
import Verify from "./pages/Verify"
import "./App.css"

function App() {
  return (
    <Routes>
      {/* Home page */}
      <Route path="/" element={<Home />} />

      {/* Registration page */}
      <Route path="/register" element={<Register />} />

      {/* Webcam capture page */}
      <Route path="/webcam" element={<WebcamCapture />} />

      {/* Certificate page */}
      <Route path="/certificate" element={<Certificate />} />

      {/*Verify Page*/}
      <Route path="/verify" element={<Verify />} />
    </Routes>
  )
}

export default App
