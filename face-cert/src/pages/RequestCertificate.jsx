import { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"

import Sidebar from "../components/Sidebar"

import "../styles/requestCertificate.css"

function RequestCertificate() {

  // ===================================================
  // STATES
  // ===================================================

  const webcamRef = useRef(null)

  const [capturedImage, setCapturedImage] = useState(null)

  const [student, setStudent] = useState(null)

  const [loading, setLoading] = useState(false)

  const [verified, setVerified] = useState(false)

  const [message, setMessage] = useState("")

  const [biometricVerified, setBiometricVerified] = useState(false)

  const [fingerprintVerified, setFingerprintVerified] = useState(false)

  // ===================================================
  // CAPTURE FACE
  // ===================================================

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

  const captureBiometricFrames = async () => {

    const frames = []

    await wait(600)

    for (let index = 0; index < 3; index += 1) {

      const imageSrc = webcamRef.current.getScreenshot()

      if (!imageSrc) {

        return []
      }

      frames.push(imageSrc)

      if (index < 2) {

        await wait(450)
      }
    }

    return frames
  }

  const captureFace = async () => {

    setLoading(true)
    setVerified(false)
    setBiometricVerified(false)
    setFingerprintVerified(false)
    setMessage("Look at the camera and make a small natural movement...")

    const biometricFrames = await captureBiometricFrames()

    if (biometricFrames.length < 3) {

      setLoading(false)
      alert("Failed to capture biometric frames")

      return
    }

    setCapturedImage(biometricFrames[0])

    try {

      setMessage("Checking biometric liveness...")

      const response = await fetch(
        "/api/verify",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            images: biometricFrames
          })

        }
      )

      const result = await response.json()

      setLoading(false)

      if (result.success) {

        setBiometricVerified(Boolean(result.biometric_verified))
        setStudent(result.student)

        const fingerprintOk = await verifyDeviceFingerprint(
          result.student.student_id
        )

        if (!fingerprintOk) {

          setLoading(false)
          setVerified(false)
          setFingerprintVerified(false)
          setStudent(null)
          setMessage("Device biometric verification failed")

          return
        }

        setVerified(true)
        setFingerprintVerified(true)
        localStorage.setItem("student_id", result.student.student_id)
        localStorage.setItem("student", JSON.stringify(result.student))

        setMessage("Face and device biometrics verified")

      } else {

        setVerified(false)
        setBiometricVerified(false)
        setFingerprintVerified(false)

        setStudent(null)

        setMessage(result.message)

      }

    } catch (error) {

      setLoading(false)

      setMessage("Backend connection failed")

      console.error(error)
    }
  }

  const verifyDeviceFingerprint = async (studentId) => {

    if (!window.PublicKeyCredential) {

      alert("This browser does not support device biometric/passkey verification. Please use a phone or laptop with passkey support.")

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

      setMessage(challengeResult.message)

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

      setMessage(verifyResult.message)

      return false
    }

    return true
  }

  // ===================================================
  // SEND REQUEST
  // ===================================================

  const sendRequest = async () => {

    if (!student) {

      alert("Verify your face first")

      return
    }

    try {

      setLoading(true)

      const response = await fetch(
        "/api/request-certificate",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            student_id: student.student_id

          })

        }
      )

      const result = await response.json()

      setLoading(false)

      if (result.success) {

        alert(
          "Request submitted successfully\n\nYou will receive your clearance message or approval date shortly."
        )

      } else {

        alert(result.message)
      }

    } catch (error) {

      setLoading(false)

      alert("Backend connection failed")

      console.error(error)
    }
  }

  return (

    <div className="request-page">

      {/* ===================================================
          SHARED SIDEBAR
      =================================================== */}

      <Sidebar active="request" />

      {/* ===================================================
          MAIN SECTION
      =================================================== */}

      <main className="request-main">

        {/* HEADER */}

        <div className="request-header">

          <h1>
            Request Certificate
          </h1>

          <p>
            Complete face and device biometric verification before sending request
          </p>

        </div>

        {/* ===================================================
            CARD
        =================================================== */}

        <div className="request-card">

          {/* WEBCAM */}

          <div className="webcam-section">

            <Webcam
              ref={webcamRef}
              screenshotFormat="image/png"
              className="webcam"
            />

          </div>

          {/* BUTTONS */}

          <div className="request-buttons">

            <button
              className="fingerprint-btn"
              onClick={() =>
                alert("Device biometric prompt opens after face verification identifies the student.")
              }
            >

              {fingerprintVerified
                ? "Device Biometric Verified"
                : "Device Biometric Required"}

            </button>

            <button
              className="capture-btn"
              onClick={captureFace}
            >

              Capture & Verify

            </button>

            <button
              className="submit-btn"
              onClick={sendRequest}
              disabled={!verified}
            >

              {loading
                ? "Processing..."
                : "Submit Request"}

            </button>

          </div>

          {/* MESSAGE */}

          {message && (

            <div
              className={
                verified
                  ? "success-box"
                  : "error-box"
              }
            >

              {message}

            </div>

          )}

          {capturedImage && (

            <div className="biometric-proof">

              <img
                src={capturedImage}
                alt="Biometric capture"
              />

              <div>
                <h3>
                  Face Biometric Check
                </h3>

                <p>
                  {biometricVerified
                    ? "Live biometric frames confirmed"
                    : "Waiting for successful liveness check"}
                </p>
              </div>

            </div>

          )}

          {(student || fingerprintVerified) && (

            <div className="fingerprint-proof">

              <div>
                <h3>
                  Device Biometric Check
                </h3>

                <p>
                  {fingerprintVerified
                    ? "Device biometric accepted"
                    : "Waiting for device biometric prompt"}
                </p>
              </div>

            </div>

          )}

          {/* STUDENT DETAILS */}

          {student && (

            <div className="student-info">

              <h3>
                Verified Student
              </h3>

              <p>
                <strong>Name:</strong>
                {" "}
                {student.full_name}
              </p>

              <p>
                <strong>Student ID:</strong>
                {" "}
                {student.student_id}
              </p>

              <p>
                <strong>Faculty:</strong>
                {" "}
                {student.faculty}
              </p>

              <p>
                <strong>Programme:</strong>
                {" "}
                {student.programme}
              </p>

            </div>

          )}

        </div>

      </main>

    </div>
  )
}

export default RequestCertificate

