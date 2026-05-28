import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"


import bgImage from "../assets/bg.jpg"

function Register() {
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // ============================
  // FORM STATE
  // ============================
  const [fullName, setFullName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [programme, setProgramme] = useState("")
  const [faculty, setFaculty] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  // ==================================================
  // RESTORE FORM DATA + IMAGE
  // ==================================================
  useEffect(() => {
    const savedForm = JSON.parse(localStorage.getItem("registerForm"))
    const savedImage = localStorage.getItem("capturedFace")

    if (savedForm) {
      setFullName(savedForm.fullName)
      setStudentId(savedForm.studentId)
      setProgramme(savedForm.programme)
      setFaculty(savedForm.faculty)
      setEmail(savedForm.email)
      setPassword(savedForm.password)
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
        faculty,
        email,
        password,
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

    reader.onloadend = () => {
      setImage(reader.result)
    }

    reader.readAsDataURL(file)
  }

  // ============================
  // OPEN CAMERA
  // ============================
  const handleTakePicture = () => {
    saveFormToStorage()
    navigate("/webcam")
  }

  // ============================
  // REGISTER STUDENT
  // ============================
  const handleRegister = async () => {
    if (
      !fullName ||
      !studentId ||
      !programme ||
      !faculty ||
      !email ||
      !password ||
      !image
    ) {
      alert("Please complete all fields")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/register-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          student_id: studentId,
          programme,
          faculty,
          email,
          password,
          image,
        }),
      })

      const result = await response.json()

      setLoading(false)

      if (result.success) {
        navigate("/certificate", {
          state: {
            fullName,
            studentId,
            programme,
            faculty,
            email,
            image,
          },
        })

        localStorage.removeItem("registerForm")

        setFullName("")
        setStudentId("")
        setProgramme("")
        setFaculty("")
        setEmail("")
        setPassword("")
        setImage(null)

      } else {
        alert(result.message || "Registration failed")
      }

    } catch (error) {
      setLoading(false)
      alert("Backend not connected")
      console.error(error)
    }
  }

  return (
    <>
    

      <div
        className="auth-page"
        style={{
          backgroundImage: `url(${bgImage})`
        }}
      >
        <div className="register-card">

          <h2 className="register-title">
            Student Registration
          </h2>

          <label>Full Name *</label>
          <input
            value={fullName}
            onChange={(e)=>setFullName(e.target.value)}
          />

          <label>Student ID *</label>
          <input
            value={studentId}
            onChange={(e)=>setStudentId(e.target.value)}
          />

          <label>Programme *</label>
          <input
            value={programme}
            onChange={(e)=>setProgramme(e.target.value)}
          />

          <label>Faculty *</label>
          <input
            value={faculty}
            onChange={(e)=>setFaculty(e.target.value)}
          />

          <label>Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <label>Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {/* Hidden upload */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* Buttons */}
          <div className="image-buttons">

            <button
              className="outline-btn"
              onClick={handleUploadClick}
            >
              Upload Image
            </button>

            <button
              className="outline-btn"
              onClick={handleTakePicture}
            >
              Take Picture
            </button>

          </div>

          {/* Preview */}
          {image && (
            <div className="preview-section">
              <h3>Selected Photo</h3>

              <img
                src={image}
                alt="preview"
                className="preview-img"
              />
            </div>
          )}

          {/* Register */}
          <button
            className="register-btn"
            onClick={handleRegister}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </div>
      </div>

    
    </>
  )
}

export default Register

