// ======================================================
// WEBCAM PAGE
// FILE: src/pages/WebcamCapture.jsx
// ======================================================

import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import bgImage from "../assets/bg.jpg"

function WebcamCapture() {

  const navigate = useNavigate()

  const videoRef = useRef(null)

  const canvasRef = useRef(null)

  const [loading, setLoading] = useState(false)

  const [cameraError, setCameraError] = useState(false)

  // =====================================
  // START CAMERA
  // =====================================

  useEffect(() => {

    startCamera()

  }, [])

  // =====================================
  // CAMERA ACCESS
  // =====================================

  const startCamera = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: true,
          audio: false

        })

      if (videoRef.current) {

        videoRef.current.srcObject = stream
      }

    } catch (error) {

      console.error(error)

      setCameraError(true)

      alert("Please allow camera access")
    }
  }

  // =====================================
  // CAPTURE IMAGE
  // =====================================

  const capturePhoto = async () => {

    try {

      setLoading(true)

      const video = videoRef.current

      const canvas = canvasRef.current

      const ctx = canvas.getContext("2d")

      canvas.width = video.videoWidth

      canvas.height = video.videoHeight

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      )

      const imageData =
        canvas.toDataURL("image/png")

      // =================================
      // VERIFY FACE
      // =================================

      const response = await fetch(

        "/api/test-camera",

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            image: imageData
          })
        }
      )

      const result = await response.json()

      setLoading(false)

      if (result.success) {

        localStorage.setItem(
          "capturedFace",
          imageData
        )

        alert("Face captured successfully")

        navigate("/auth")

      } else {

        alert(
          result.message ||
          "Face not detected"
        )
      }

    } catch (error) {

      setLoading(false)

      console.error(error)

      alert("Backend connection failed")
    }
  }

  return (

    <div
      className="auth-page"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    >

      <div className="auth-card">

        <div className="auth-form">

          <h2>Face Registration</h2>

          {cameraError ? (

            <p className="error-text">
              Camera access denied
            </p>

          ) : (

            <>
              <div className="camera-frame">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="webcam-video"
                />

                <canvas
                  ref={canvasRef}
                  style={{ display: "none" }}
                />

              </div>

              <button
                className="auth-btn"
                onClick={capturePhoto}
              >

                {loading
                  ? "Processing..."
                  : "Capture Face"}

              </button>
            </>
          )}

        </div>

      </div>

    </div>
  )
}

export default WebcamCapture

