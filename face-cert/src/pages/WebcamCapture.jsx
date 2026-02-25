import { useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function WebcamCapture() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
    } catch (err) {
      alert("Please allow camera access")
      console.error(err)
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject
    if (stream) stream.getTracks().forEach(track => track.stop())
  }

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL("image/png")

    localStorage.setItem("capturedFace", imageData)
    stopCamera()
    navigate("/register")
  }

  const handleCancel = () => {
    stopCamera()
    navigate("/register")
  }

  return (
    <>
      <Navbar />

      <div className="register-page">
        <div className="register-card">

          <h2 className="register-title">CAPTURE FACE</h2>

          <div className="camera-frame">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="webcam-video"
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          <div className="image-buttons">
            <button className="register-btn" onClick={handleCapture}>
              Capture Photo 📸
            </button>

            <button className="outline-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

export default WebcamCapture
