import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import bgImage from "../assets/bg.jpg"

import "../styles/admin.css"

function AdminLogin() {
  const navigate = useNavigate()

  const [hasAdmins, setHasAdmins] = useState(true)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    checkAdminUsers()
  }, [])

  const checkAdminUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const result = await response.json()

      if (result.success) {
        setHasAdmins(
          result.users.some((user) => user.email)
        )
      }

      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password")
      return
    }

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem("admin", JSON.stringify(result.admin))
        navigate("/admin")
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error(error)
      alert("Backend connection failed")
    }
  }

  const handleSetup = async () => {
    if (!fullName || !email || !password) {
      alert("Please complete all fields")
      return
    }

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password
        })
      })

      const result = await response.json()

      if (result.success) {
        alert("First admin created successfully")
        setHasAdmins(true)
        setFullName("")
        setPassword("")
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error(error)
      alert("Backend connection failed")
    }
  }

  return (
    <div
      className="admin-auth-page"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    >
      <div className="admin-auth-overlay"></div>

      <div className="admin-auth-card">
        <h1>Staff Access</h1>

        <p>
          {hasAdmins
            ? "Authorized staff sign in to manage certificate requests"
            : "Create the first admin account"}
        </p>

        {loading ? (
          <div className="admin-auth-loading">Checking admin setup...</div>
        ) : (
          <>
            {!hasAdmins && (
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              className="admin-auth-submit"
              onClick={hasAdmins ? handleLogin : handleSetup}
            >
              {hasAdmins ? "Login" : "Create Admin"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminLogin

