import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import Icon from "../components/Icon"

import "../App.css"

function Home() {

  const navigate = useNavigate()

  useEffect(() => {

    const storedStudent = JSON.parse(localStorage.getItem("student") || "{}")
    const studentId =
      localStorage.getItem("student_id") || storedStudent.student_id

    if (!studentId) {

      navigate("/auth")
    }

  }, [navigate])

  return (

    <div className="dashboard-page">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="dashboard-main">

        {/* HEADER */}
        <div className="dashboard-header">

          <div>

            <h1>
              Welcome Back
            </h1>

            <p>
              Manage certificate requests
              and biometric verification
            </p>

          </div>

          <button
            type="button"
            className="dashboard-user profile-button"
            onClick={() =>
              navigate("/profile")
            }
            aria-label="Open student profile"
          >

            <div className="user-circle">
              👤
            </div>

          </button>

        </div>

        {/* HERO */}
        <div className="hero-card">

          <div className="hero-left">

            <h2>
              Request Your Certificate
            </h2>

            <p>
              Use device biometric and facial recognition
              to securely request and collect your certificate.
            </p>

            <button
              className="hero-btn"

              onClick={() =>
                navigate("/request-certificate")
              }
            >
              Request Certificate
            </button>

          </div>

          <div className="hero-right">

            <div className="hero-icon">
              <Icon name="document" size={56} />
            </div>

          </div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-section">

          <h3>
            Quick Actions
          </h3>

          <div className="quick-grid">

            <div
              className="quick-card"

              onClick={() =>
                navigate("/request-certificate")
              }
            >

              <div className="quick-icon">
                <Icon name="camera" size={34} />
              </div>

              <h4>
                Biometric Verification
              </h4>

              <p>
                Verify identity with face and device biometric
              </p>

            </div>

            <div
              className="quick-card"

              onClick={() =>
                navigate("/messages")
              }
            >

              <div className="quick-icon">
                <Icon name="mail" size={34} />
              </div>

              <h4>
                Messages
              </h4>

              <p>
                Receive admin updates
              </p>

            </div>

            <div
              className="quick-card"

              onClick={() =>
                navigate("/profile")
              }
            >

              <div className="quick-icon">
                <Icon name="user" size={34} />
              </div>

              <h4>
                Profile
              </h4>

              <p>
                Manage student profile
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

export default Home
