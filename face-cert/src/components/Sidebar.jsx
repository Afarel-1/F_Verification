import { useEffect, useState } from "react"

import {
  useNavigate,
  useLocation
} from "react-router-dom"

import bgImage from "../assets/bg.jpg"
import appLogo from "../assets/facial logo.png"
import Icon from "./Icon"

import "../styles/sidebar.css"

function Sidebar() {

  const navigate = useNavigate()

  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {

    fetchUnreadMessages()

  }, [location.pathname])

  const fetchUnreadMessages = async () => {

    try {

      const storedStudent = JSON.parse(localStorage.getItem("student") || "{}")
      const studentId =
        localStorage.getItem("student_id") || storedStudent.student_id

      if (!studentId) {

        setUnreadCount(0)

        return
      }

      const response = await fetch(
        `/api/student/messages/${encodeURIComponent(studentId)}`
      )

      const result = await response.json()

      if (result.success) {

        const count = result.messages.filter(
          (message) => !message.is_read
        ).length

        setUnreadCount(count)
      }

    } catch (error) {

      console.error(error)
    }
  }

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {

    localStorage.removeItem("student")
    localStorage.removeItem("student_id")

    navigate("/auth")
  }

  return (

    <>

      {/* MOBILE TOGGLE */}
      <div
        className="menu-toggle"

        onClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
      >

        <Icon name={sidebarOpen ? "close" : "menu"} />

      </div>

      {/* SIDEBAR */}
      <aside
        className={
          sidebarOpen
            ? "sidebar sidebar-open"
            : "sidebar"
        }

        style={{
          backgroundImage: `url(${bgImage})`
        }}
      >

        {/* OVERLAY */}
        <div className="sidebar-overlay"></div>

        {/* CONTENT */}
        <div className="sidebar-content">

          {/* TOP */}
          <div>

            <div className="sidebar-top">

              <img
                className="sidebar-logo"
                src={appLogo}
                alt="Pentvars Certificate Verification"
              />

              <p className="sidebar-subtitle">
                Student Verification System
              </p>

            </div>

            {/* MENU */}
            <div className="sidebar-menu">

              {/* HOME */}
              <div
                className={
                  location.pathname === "/home"
                    ? "sidebar-item active-sidebar"
                    : "sidebar-item"
                }

                onClick={() => {

                  navigate("/home")

                  setSidebarOpen(false)
                }}
              >

                <Icon name="home" />

                <p>Home</p>

              </div>

              {/* REQUEST */}
              <div
                className={
                  location.pathname === "/request-certificate"
                    ? "sidebar-item active-sidebar"
                    : "sidebar-item"
                }

                onClick={() => {

                  navigate("/request-certificate")

                  setSidebarOpen(false)
                }}
              >

                <Icon name="document" />

                <p>Request Certificate</p>

              </div>

              {/* PROFILE */}
              <div
                className={
                  location.pathname === "/profile"
                    ? "sidebar-item active-sidebar"
                    : "sidebar-item"
                }

                onClick={() => {

                  navigate("/profile")

                  setSidebarOpen(false)
                }}
              >

                <Icon name="user" />

                <p>Profile</p>

              </div>

              {/* MESSAGES */}
              <div
                className={
                  location.pathname === "/messages"
                    ? "sidebar-item active-sidebar"
                    : "sidebar-item"
                }

                onClick={() => {

                  navigate("/messages")

                  setSidebarOpen(false)
                }}
              >

                <Icon name="message" />

                <p>Messages</p>

                {unreadCount > 0 && (
                  <strong className="message-badge">
                    {unreadCount}
                  </strong>
                )}

              </div>

            </div>

          </div>

          {/* BOTTOM */}
          <div className="sidebar-bottom">

            <button
              className="logout-btn"

              onClick={handleLogout}
            >

              <Icon name="logout" />
              Logout

            </button>

          </div>

        </div>

      </aside>

    </>
  )
}

export default Sidebar

