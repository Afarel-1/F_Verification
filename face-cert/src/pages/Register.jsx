import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function Register() {
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // ============================
  // FORM STATE
  // ============================
  const [fullName, setFullName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [programme, setProgramme] = useState("")
  const [duration, setDuration] = useState("")
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  // ==================================================
  // RESTORE FORM DATA + IMAGE WHEN PAGE LOADS
  // ==================================================
  useEffect(() => {
    const savedForm = JSON.parse(localStorage.getItem("registerForm"))
    const savedImage = localStorage.getItem("capturedFace")

    if (savedForm) {
      setFullName(savedForm.fullName)
      setStudentId(savedForm.studentId)
      setProgramme(savedForm.programme)
      setDuration(savedForm.duration)
    }

    if (savedImage) {
      setImage(savedImage)
      localStorage.removeItem("capturedFace")
    }
  }, [])

  // ============================
  // SAVE FORM BEFORE CAMERA
  // ============================
  const saveFormToStorage = () => {
    localStorage.setItem(
      "registerForm",
      JSON.stringify({
        fullName,
        studentId,
        programme,
        duration,
      })
    )
  }

  // ============================
  // FILE UPLOAD
  // ============================
  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  // ============================
  // OPEN WEBCAM
  // ============================
  const handleTakePicture = () => {
    saveFormToStorage()
    navigate("/webcam")
  }

  // ============================
  // REGISTER STUDENT
  // ============================
  const handleRegister = async () => {
    // 🔒 REQUIRED FIELDS CHECK
    if (!fullName || !studentId || !programme || !duration || !image) {
      alert("Please complete all fields and capture a face image ❌")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("http://127.0.0.1:5000/register-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          student_id: studentId,
          programme,
          duration,
          image,
        }),
      })

      const result = await response.json()
      setLoading(false)
if (result.success) {
  // Redirect to certificate page with student data
  navigate("/certificate", {
    state: {
      fullName,
      studentId,
      programme,
      duration,
      image
    }
  })

  // Clear stored form
  localStorage.removeItem("registerForm")

  // Optional: reset form (won’t matter after redirect)
  setFullName("")
  setStudentId("")
  setProgramme("")
  setDuration("")
  setImage(null)
} else {
        alert(result.message || "Registration failed ❌")
      }
    } catch (error) {
      setLoading(false)
      alert("Backend not connected ❌")
      console.error(error)
    }
  }

  return (
    <>
      <Navbar />

      <div className="register-page">
        <div className="register-card">
          <h2 className="register-title">REGISTRATION</h2>

          <label>Full Name *</label>
          <input value={fullName} onChange={(e)=>setFullName(e.target.value)} />

          <label>Student ID *</label>
          <input value={studentId} onChange={(e)=>setStudentId(e.target.value)} />

          <label>Programme *</label>
          <input value={programme} onChange={(e)=>setProgramme(e.target.value)} />

          <label>Start Year - Completion *</label>
          <select value={duration} onChange={(e)=>setDuration(e.target.value)}>
            <option value="">Select duration</option>
            <option>2022 - 2026</option>
            <option>2023 - 2027</option>
            <option>2024 - 2028</option>
          </select>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div className="image-buttons">
            <button className="outline-btn" onClick={handleUploadClick}>
              Upload Image
            </button>

            <button className="outline-btn" onClick={handleTakePicture}>
              Take Picture
            </button>
          </div>

          {image && (
            <div className="preview-section">
              <h3>Selected Photo</h3>
              <img src={image} alt="preview" className="preview-img"/>
            </div>
          )}

          <button className="register-btn" onClick={handleRegister}>
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Register
