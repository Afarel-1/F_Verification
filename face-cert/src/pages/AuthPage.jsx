// ======================================================
// AUTH PAGE
// FILE: src/pages/AuthPage.jsx
// ======================================================

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import bgImage from "../assets/bg.jpg"

function AuthPage() {

  const navigate = useNavigate()

  // =====================================
  // ACTIVE TAB
  // =====================================

  const [activeTab, setActiveTab] = useState("signup")

  // =====================================
  // PASSWORD VISIBILITY
  // =====================================

  const [showPassword, setShowPassword] = useState(false)

  // =====================================
  // SIGNUP STATES
  // =====================================

  const [fullName, setFullName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [email, setEmail] = useState("")
  const [faculty, setFaculty] = useState("")
  const [programme, setProgramme] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [image, setImage] = useState(null)
  const [fingerprintCredentialId, setFingerprintCredentialId] = useState("")

  // =====================================
  // LOGIN STATES
  // =====================================

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // =====================================
  // ERROR STATES
  // =====================================

  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // =====================================
  // LOADING
  // =====================================

  const [loading, setLoading] = useState(false)

  // =====================================
  // RESTORE SAVED FACE
  // =====================================

  useEffect(() => {

    const savedImage = localStorage.getItem("capturedFace")

    if (savedImage) {

      setImage(savedImage)

      localStorage.removeItem("capturedFace")
    }

  }, [])

  // =====================================
  // RESTORE FORM DATA
  // =====================================

  useEffect(() => {

    const savedData = JSON.parse(
      localStorage.getItem("signupData")
    )

    if (savedData) {

      setFullName(savedData.fullName || "")
      setStudentId(savedData.studentId || "")
      setEmail(savedData.email || "")
      setFaculty(savedData.faculty || "")
      setProgramme(savedData.programme || "")
      setPassword(savedData.password || "")
      setConfirmPassword(savedData.confirmPassword || "")
    }

  }, [])

  // =====================================
  // SAVE FORM BEFORE CAMERA
  // =====================================

  const saveFormData = () => {

    localStorage.setItem(

      "signupData",

      JSON.stringify({

        fullName,
        studentId,
        email,
        faculty,
        programme,
        password,
        confirmPassword

      })
    )
  }

  // =====================================
  // OPEN CAMERA PAGE
  // =====================================

  const handleRegisterFace = () => {

    saveFormData()

    navigate("/webcam")
  }

  // =====================================
  // DEVICE FINGERPRINT REGISTRATION
  // =====================================

  const textToBuffer = (value) =>
    new TextEncoder().encode(value)

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

  const handleRegisterFingerprint = async () => {

    if (!studentId || !email || !fullName) {

      alert("Enter your name, student ID, and email before registering fingerprint")

      return
    }

    if (!window.PublicKeyCredential) {

      alert("This browser does not support device fingerprint verification. Please use a phone or laptop with fingerprint/passkey support.")

      return
    }

    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

    if (!available) {

      alert("No fingerprint/passkey feature was found on this device. Please use or borrow a phone/laptop with fingerprint support.")

      return
    }

    try {

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: "Face Certificate Verification"
          },
          user: {
            id: textToBuffer(studentId),
            name: email,
            displayName: fullName
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred"
          },
          timeout: 60000,
          attestation: "none"
        }
      })

      setFingerprintCredentialId(
        bufferToBase64Url(credential.rawId)
      )

      alert("Fingerprint device registered successfully")

    } catch (error) {

      console.error(error)

      alert("Fingerprint registration was cancelled or failed")
    }
  }

  // =====================================
  // EMAIL VALIDATION
  // =====================================

  const validateEmail = (email) => {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return regex.test(email)
  }

  // =====================================
  // SIGNUP
  // =====================================

  const handleSignup = async () => {

    setEmailError("")
    setPasswordError("")

    // REQUIRED FIELDS

    if (

      !fullName ||
      !studentId ||
      !email ||
      !faculty ||
      !programme ||
      !password ||
      !confirmPassword ||
      !image ||
      !fingerprintCredentialId

    ) {

      alert("Please complete all fields, register your face, and register device fingerprint")

      return
    }

    // EMAIL VALIDATION

    if (!validateEmail(email)) {

      setEmailError("Please enter a valid email")

      return
    }

    // PASSWORD VALIDATION

    if (password !== confirmPassword) {

      setPasswordError("Passwords do not match")

      return
    }

    try {

      setLoading(true)

      const response = await fetch(

        "/api/signup",

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            full_name: fullName,
            student_id: studentId,
            email,
            faculty,
            programme,
            password,
            image,
            fingerprint_credential_id: fingerprintCredentialId

          })
        }
      )

      const result = await response.json()

      setLoading(false)

      if (result.success) {

        alert("Account created successfully 🎉")

        localStorage.setItem("student_id", studentId)
        localStorage.setItem(
          "student",
          JSON.stringify({
            full_name: fullName,
            student_id: studentId,
            email,
            faculty,
            programme
          })
        )

        // CLEAR STORAGE

        localStorage.removeItem("signupData")

        // RESET FORM

        setFullName("")
        setStudentId("")
        setEmail("")
        setFaculty("")
        setProgramme("")
        setPassword("")
        setConfirmPassword("")
        setImage(null)
        setFingerprintCredentialId("")

        // GO HOME

        navigate("/home")

      } else {

        alert(result.message)
      }

    } catch (error) {

      setLoading(false)

      alert("Backend connection failed")

      console.error(error)
    }
  }

  // =====================================
  // LOGIN
  // =====================================

  const handleLogin = async () => {

    if (!loginEmail || !loginPassword) {

      alert("Please enter email and password")

      return
    }

    try {

      setLoading(true)

      const response = await fetch(

        "/api/login",

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            email: loginEmail,
            password: loginPassword

          })
        }
      )

      const result = await response.json()

      setLoading(false)

      if (result.success) {

        alert("Login successful 🎉")

        localStorage.setItem("student_id", result.student.student_id)
        localStorage.setItem("student", JSON.stringify(result.student))

        navigate("/home")

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

    <div
      className="auth-page"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    >

      <div className="auth-card">

        {/* TABS */}

        <div className="auth-tabs">

          <button
            className={
              activeTab === "signup"
                ? "active-tab"
                : ""
            }
            onClick={() => setActiveTab("signup")}
          >
            Signup
          </button>

          <div className="tab-divider"></div>

          <button
            className={
              activeTab === "login"
                ? "active-tab"
                : ""
            }
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>

        </div>

        {/* SIGNUP */}

        {activeTab === "signup" && (

          <div className="auth-form">

            <h2>Student Registration</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value)
              }
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              className={
                emailError
                  ? "input-error"
                  : ""
              }
              onChange={(e) => {

                setEmail(e.target.value)

                setEmailError("")
              }}
            />

            {emailError && (
              <p className="error-text">
                {emailError}
              </p>
            )}

            <select
              value={faculty}
              onChange={(e) =>
                setFaculty(e.target.value)
              }
            >

              <option value="">
                Select Faculty
              </option>

              <option>
                Faculty of Computing
              </option>

              <option>
                Faculty of Engineering
              </option>

              <option>
                Faculty of Business
              </option>

            </select>

            <select
              value={programme}
              onChange={(e) =>
                setProgramme(e.target.value)
              }
            >

              <option value="">
                Select Programme
              </option>

              <option>
                BSc Information Technology
              </option>

              <option>
                BSc Computer Science
              </option>

              <option>
                BSc Cyber Security
              </option>

            </select>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              className={
                passwordError
                  ? "input-error"
                  : ""
              }
              onChange={(e) => {

                setConfirmPassword(
                  e.target.value
                )

                setPasswordError("")
              }}
            />

            {passwordError && (
              <p className="error-text">
                {passwordError}
              </p>
            )}

            {/* FACE BUTTON */}

            <button
              className="face-btn"
              onClick={handleRegisterFace}
            >

              {image
                ? "Face Registered"
                : "Register Face"}

            </button>

            <button
              className="face-btn"
              onClick={handleRegisterFingerprint}
            >

              {fingerprintCredentialId
                ? "Fingerprint Device Registered"
                : "Register Fingerprint Device"}

            </button>

            {/* SIGNUP BUTTON */}

            <button
              className="auth-btn"
              onClick={handleSignup}
            >

              {loading
                ? "Creating..."
                : "Signup"}

            </button>

          </div>
        )}

        {/* LOGIN */}

        {activeTab === "login" && (

          <div className="auth-form">

            <h2>Welcome Back</h2>

            <input
              type="email"
              placeholder="Email Address"
              value={loginEmail}
              onChange={(e) =>
                setLoginEmail(e.target.value)
              }
            />

            <div className="password-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(
                    e.target.value
                  )
                }
              />

              <span
                className="show-password"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >

                {showPassword
                  ? "Hide"
                  : "Show"}

              </span>

            </div>

            <button
              className="auth-btn"
              onClick={handleLogin}
            >

              {loading
                ? "Logging in..."
                : "Login"}

            </button>

          </div>
        )}

      </div>

    </div>
  )
}

export default AuthPage

