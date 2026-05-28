import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../components/Sidebar"
import Icon from "../components/Icon"

import "../styles/profile.css"

function Profile() {
  const navigate = useNavigate()


  // =====================================================
  // STATES
  // =====================================================

  const [student, setStudent] = useState(null)

  const [loading, setLoading] = useState(true)

  // =====================================================
  // GET LOGGED IN STUDENT
  // =====================================================

  useEffect(() => {

    fetchStudentProfile()

  }, [])

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchStudentProfile = async () => {

    try {

      // ===============================================
      // GET STORED STUDENT ID
      // ===============================================

      const storedStudent = JSON.parse(localStorage.getItem("student") || "{}")
      const studentId =
        localStorage.getItem("student_id") || storedStudent.student_id

      if (!studentId) {

        navigate("/auth")

        setLoading(false)

        return
      }

      // ===============================================
      // FETCH FROM BACKEND
      // ===============================================

      const response = await fetch(

        `/api/student-profile/${encodeURIComponent(studentId)}`

      )

      const result = await response.json()

      if (result.success) {

        setStudent(result.student)

      }

      setLoading(false)

    } catch (error) {

      console.error(error)

      setLoading(false)
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="profile-page">

        <Sidebar active="profile" />

        <main className="profile-main">

          <div className="profile-loading">

            Loading profile...

          </div>

        </main>

      </div>
    )
  }

  return (

    <div className="profile-page">

      {/* =====================================================
          SHARED SIDEBAR
      ===================================================== */}

      <Sidebar active="profile" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="profile-main">

        {/* HEADER */}

        <div className="profile-header">

          <div>

            <h1>
              Student Profile
            </h1>

            <p>
              View your student information
            </p>

          </div>

        </div>

        {/* =====================================================
            PROFILE CARD
        ===================================================== */}

        <div className="profile-card">

          {/* ICON */}

          <div className="profile-avatar">

            <Icon name="user" size={48} />

          </div>

          {/* NAME */}

          <h2>

            {student?.full_name}

          </h2>

          {/* EMAIL */}

          <p className="profile-email">

            {student?.email}

          </p>

          {/* DETAILS */}

          <div className="profile-details">

            <div className="profile-info">

              <h4>
                Student ID
              </h4>

              <p>
                {student?.student_id}
              </p>

            </div>

            <div className="profile-info">

              <h4>
                Faculty
              </h4>

              <p>
                {student?.faculty}
              </p>

            </div>

            <div className="profile-info">

              <h4>
                Programme
              </h4>

              <p>
                {student?.programme}
              </p>

            </div>

            <div className="profile-info">

              <h4>
                Certificate Status
              </h4>

              <p
                className={
                  student?.request_status === "Approved"
                    ? "approved-status"
                    : student?.request_status === "Rejected"
                    ? "rejected-status"
                    : "pending-status"
                }
              >

                {student?.request_status}

              </p>

            </div>

            <div className="profile-info">

              <h4>
                Admin Message
              </h4>

              <p>

                {student?.admin_message
                  ? student.admin_message
                  : "No admin message yet."}

              </p>

            </div>

            <div className="profile-info">

              <h4>
                Collection Date
              </h4>

              <p>
                {student?.collection_date
                  ? student.collection_date
                  : "Not scheduled yet"}
              </p>

            </div>

            <div className="profile-info">

              <h4>
                Collection Status
              </h4>

              <p
                className={
                  student?.certificate_collected
                    ? "collected-status"
                    : "pending-status"
                }
              >

                {student?.certificate_collected
                  ? "Collected"
                  : "Not collected"}

              </p>

            </div>

            {student?.collected_at && (

              <div className="profile-info">

                <h4>
                  Collected At
                </h4>

                <p>
                  {student.collected_at}
                </p>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  )
}

export default Profile

