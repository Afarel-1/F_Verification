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

  const wait = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds))

  const base64UrlToBuffer = (value) => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    )
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }

    return bytes.buffer
  }

  const bufferToBase64Url = (buffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ""

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte)
    })

    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  }

  const captureFrame = () => {
    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL("image/png")
  }

  const captureBiometricFrames = async () => {
    const frames = []

    await wait(600)

    for (let index = 0; index < 3; index += 1) {
      frames.push(captureFrame())

      if (index < 2) {
        await wait(450)
      }
    }

    return frames
  }

  const captureAndVerify = async () => {
    setLoading(true)
    setResult(null)

    const biometricFrames = await captureBiometricFrames()

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          images: biometricFrames
        })
      })

      const data = await response.json()

      if (data.success) {
        const fingerprintOk = await verifyDeviceFingerprint(
          data.student.student_id
        )

        data.fingerprint_verified = fingerprintOk
        data.success = fingerprintOk

        if (!fingerprintOk) {
          data.message = "Device biometric verification failed"
        }
      }

      setLoading(false)
      setResult(data)

    } catch (error) {
      setLoading(false)
      alert("Backend not connected")
      console.error(error)
    }
  }

  const verifyDeviceFingerprint = async (studentId) => {
    if (!window.PublicKeyCredential) {
      alert("This browser does not support device biometric/passkey verification.")
      return false
    }

    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

    if (!available) {
      alert("No device biometric/passkey feature was found on this device.")
      return false
    }

    const challengeResponse = await fetch(
      "/api/biometric/challenge",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          student_id: studentId
        })
      }
    )

    const challengeResult = await challengeResponse.json()

    if (!challengeResult.success) {
      alert(challengeResult.message)
      return false
    }

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: base64UrlToBuffer(challengeResult.challenge),
        allowCredentials: [
          {
            type: "public-key",
            id: base64UrlToBuffer(challengeResult.credential_id)
          }
        ],
        userVerification: "required",
        timeout: 60000
      }
    })

    const verifyResponse = await fetch(
      "/api/biometric/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          student_id: studentId,
          challenge: challengeResult.challenge,
          credential_id: bufferToBase64Url(credential.rawId)
        })
      }
    )

    const verifyResult = await verifyResponse.json()

    if (!verifyResult.success) {
      alert(verifyResult.message)
    }

    return verifyResult.success
  }

  return (
    <div className="container">
      <h2>Face and Device Biometric Verification</h2>

      <video
        ref={videoRef}
        autoPlay
        style={{ width: "300px", borderRadius: "10px" }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <br /><br />

      <button onClick={startCamera}>Start Camera</button>

      <button onClick={captureAndVerify} style={{ marginLeft: "10px" }}>
        Verify Face & Device Biometric
      </button>

      {loading && <p>Verifying...</p>}

      {result && result.success && (
        <div style={{ marginTop: "20px", color: "green" }}>
          <h3>Match Found</h3>
          <p>Face liveness: Passed</p>
          <p>Device biometric: Accepted</p>
          <p>Name: {result.student.full_name}</p>
          <p>ID: {result.student.student_id}</p>
          <p>Programme: {result.student.programme}</p>
          <p>Duration: {result.student.duration}</p>
        </div>
      )}

      {result && !result.success && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <h3>No Match Found</h3>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  )
}

