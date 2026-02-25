import { useRef, useState } from "react"

export default function Verify() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
  }

  const captureAndVerify = async () => {
    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL("image/png")

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("http://127.0.0.1:5000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: imageData })
      })

      const data = await response.json()
      setLoading(false)
      setResult(data)

    } catch (error) {
      setLoading(false)
      alert("Backend not connected ❌")
      console.error(error)
    }
  }

  return (
    <div className="container">
      <h2>Face Verification</h2>

      <video
        ref={videoRef}
        autoPlay
        style={{ width: "300px", borderRadius: "10px" }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <br /><br />

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureAndVerify} style={{ marginLeft: "10px" }}>
        Verify
      </button>

      {loading && <p>Verifying...</p>}

      {result && result.success && (
        <div style={{ marginTop: "20px", color: "green" }}>
          <h3>Match Found ✅</h3>
          <p>Name: {result.student.full_name}</p>
          <p>ID: {result.student.student_id}</p>
          <p>Programme: {result.student.programme}</p>
          <p>Duration: {result.student.duration}</p>
        </div>
      )}

      {result && !result.success && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <h3>No Match Found ❌</h3>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  )
}