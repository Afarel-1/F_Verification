import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import Icon from "../components/Icon"

import "../styles/messages.css"

function Messages() {
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const storedStudent = JSON.parse(localStorage.getItem("student") || "{}")
      const studentId =
        localStorage.getItem("student_id") || storedStudent.student_id

      if (!studentId) {
        navigate("/auth")
        setLoading(false)
        return
      }

      const response = await fetch(
        `/api/student/messages/${encodeURIComponent(studentId)}`
      )

      const result = await response.json()

      if (result.success) {
        setMessages(result.messages)
      }

      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await fetch(
        `/api/student/read-message/${id}`,
        {
          method: "PUT"
        }
      )

      fetchMessages()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="messages-page">
      <Sidebar active="messages" />

      <main className="messages-main">
        <div className="messages-header">
          <h1>
            Messages
            <Icon name="message" className="heading-icon" />
          </h1>
          <p>Notifications from admin</p>
        </div>

        {loading ? (
          <div className="empty-box">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-box">No messages available</div>
        ) : (
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.is_read
                    ? "message-card"
                    : "message-card unread-message"
                }
              >
                <div className="message-top">
                  <h3>{message.sender || "Admin"}</h3>

                  {!message.is_read && (
                    <span className="new-badge">NEW</span>
                  )}
                </div>

                <p className="message-text">{message.message}</p>

                <div className="message-bottom">
                  <span>{message.created_at}</span>

                  {!message.is_read && (
                    <button onClick={() => markAsRead(message.id)}>
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Messages

