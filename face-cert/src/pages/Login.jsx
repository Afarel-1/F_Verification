import { useState } from "react"

function Login() {

  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {

    if (!studentId || !password) {
      alert("Please fill all fields")
      return
    }

    try {

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          student_id: studentId,
          password: password
        })
      })

      const result = await response.json()

      if (result.success) {
        alert("Login successful")
      } else {
        alert(result.message || "Invalid credentials")
      }

    } catch (error) {
      console.error(error)
      alert("Backend connection failed")
    }
  }

  return (
    <div className="login-form">

      <h2 className="register-title">
        Student Login
      </h2>

      <label>Student ID</label>
      <input
        value={studentId}
        onChange={(e)=>setStudentId(e.target.value)}
      />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button
        className="register-btn"
        onClick={handleLogin}
      >
        Login
      </button>

    </div>
  )
}

export default Login

