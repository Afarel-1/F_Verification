// =========================================================
// IMPORTS
// =========================================================

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import bgImage from "../assets/bg.jpg"
import Icon from "../components/Icon"
import { apiUrl } from "../api"

import "../styles/admin.css"

// =========================================================
// ADMIN DASHBOARD
// =========================================================

function AdminDashboard() {
  const navigate = useNavigate()


  // =========================================================
  // STATES
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [activeTab, setActiveTab] = useState("students")

  const [students, setStudents] = useState([])

  const [requests, setRequests] = useState([])

  const [approvedStudents, setApprovedStudents] = useState([])

  const [unapprovedStudents, setUnapprovedStudents] = useState([])

  const [adminUsers, setAdminUsers] = useState([])

  const [loading, setLoading] = useState(true)

  // =========================================================
  // CREATE ADMIN USER STATES
  // =========================================================

  const [fullName, setFullName] = useState("")

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [showAdminPassword, setShowAdminPassword] = useState(false)

  const [permissions, setPermissions] = useState([
    "view_students"
  ])

  // =========================================================
  // APPROVAL STATES
  // =========================================================

  const [message, setMessage] = useState("")

  const [approvedDate, setApprovedDate] = useState("")

  const [studentSearch, setStudentSearch] = useState("")

  const [requestSearch, setRequestSearch] = useState("")

  const [approvedSearch, setApprovedSearch] = useState("")

  const [unapprovedSearch, setUnapprovedSearch] = useState("")

  const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}")
  const currentPermissions =
    currentAdmin.permissions || [
      "view_students",
      "manage_requests",
      "manage_approved",
      "manage_users"
    ]
  const canViewStudents = currentPermissions.includes("view_students")
  const canManageUsers =
    currentPermissions.includes("manage_users")
  const canManageRequests =
    currentPermissions.includes("manage_requests")
  const canManageApproved =
    currentPermissions.includes("manage_approved")
  const isSuperAdmin =
    currentPermissions.includes("view_students")
    && currentPermissions.includes("manage_requests")
    && currentPermissions.includes("manage_approved")
    && currentPermissions.includes("manage_users")

  const togglePermission = (permission) => {

    if (permission === "view_students") return

    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    )
  }

  // =========================================================
  // FETCH EVERYTHING ON LOAD
  // =========================================================

  useEffect(() => {

    const admin = JSON.parse(localStorage.getItem("admin") || "{}")

    if (!admin.id) {

      navigate("/staff-access")

      return
    }

    fetchStudents()

    fetchRequests()

    fetchApprovedStudents()

    fetchUnapprovedStudents()

    fetchAdminUsers()

  }, [navigate])

  const handleAdminLogout = () => {

    localStorage.removeItem("admin")

    navigate("/staff-access")
  }

  // =========================================================
  // FETCH REGISTERED STUDENTS
  // =========================================================

  const fetchStudents = async () => {

    try {

      const response = await fetch(
        "/api/admin/students"
      )

      const result = await response.json()

      if (result.success) {

        setStudents(result.students)

      }

      setLoading(false)

    } catch (error) {

      console.error(error)

      setLoading(false)

    }

  }

  // =========================================================
  // FETCH CERTIFICATE REQUESTS
  // =========================================================

  const fetchRequests = async () => {

    try {

      const response = await fetch(
        "/api/admin/certificate-requests"
      )

      const result = await response.json()

      if (result.success) {

        setRequests(result.requests)

      }

    } catch (error) {

      console.error(error)

    }

  }

  // =========================================================
  // FETCH APPROVED STUDENTS
  // =========================================================

  const fetchApprovedStudents = async () => {

    try {

      const response = await fetch(
        "/api/admin/approved-students"
      )

      const result = await response.json()

      if (result.success) {

        setApprovedStudents(result.students)

      }

    } catch (error) {

      console.error(error)

    }

  }

  // =========================================================
  // FETCH ADMIN USERS
  // =========================================================

  const fetchAdminUsers = async () => {

    try {

      const response = await fetch(
        "/api/admin/users"
      )

      const result = await response.json()

      if (result.success) {

        setAdminUsers(result.users)

      }

    } catch (error) {

      console.error(error)

    }

  }

  // =========================================================
  // CREATE ADMIN USER
  // =========================================================

  const handleCreateUser = async () => {

    if (!fullName || !email || !password) {

      alert("Please complete all fields")

      return

    }

    try {

      const response = await fetch(
        "/api/admin/create-user",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            full_name: fullName,
            email,
            password,
            permissions

          })

        }
      )

      const result = await response.json()

      if (result.success) {

        alert("Admin user created successfully")

        setFullName("")
        setEmail("")
        setPassword("")
        setPermissions(["view_students"])

        fetchAdminUsers()

      } else {

        alert(result.message)

      }

    } catch (error) {

      console.error(error)

      alert("Failed to create admin user")

    }

  }

  // =========================================================
  // DELETE ADMIN USER
  // =========================================================

  const deleteUser = async (id) => {

    const admin = JSON.parse(localStorage.getItem("admin") || "{}")

    if (!canManageUsers) {

      alert("You do not have permission to manage admin users")

      return

    }

    if (admin.id === id) {

      alert("You cannot delete the admin account you are using")

      return
    }

    const confirmDelete = window.confirm(
      "Delete this admin user?"
    )

    if (!confirmDelete) return

    try {

      const response = await fetch(
        `/api/admin/delete-user/${id}`,
        {
          method: "DELETE"
        }
      )

      const result = await response.json()

      if (result.success) {

        alert("Admin deleted successfully")

        fetchAdminUsers()

      }

    } catch (error) {

      console.error(error)

    }

  }

  // =========================================================
  // APPROVE REQUEST
  // =========================================================

  const approveStudent = async (studentId) => {

    if (!canManageRequests) {

      alert("You do not have permission to approve requests")

      return

    }

    if (!approvedDate || !message) {

      alert("Please add approval date and message")

      return

    }

    try {

      const response = await fetch(
        "/api/admin/approve-request",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            student_id: studentId,

            approved_date: approvedDate,

            admin_message: message

          })

        }
      )

      const result = await response.json()

      if (result.success) {

        alert("Student approved successfully")

        setApprovedDate("")
        setMessage("")

        fetchRequests()

        fetchApprovedStudents()

        fetchUnapprovedStudents()

      } else {

        alert(result.message)

      }

    } catch (error) {

      console.error(error)

    }

  }

  // =========================================================
  // REJECT REQUEST
  // =========================================================

  const rejectStudent = async (studentId) => {

    if (!canManageRequests) {

      alert("You do not have permission to reject requests")

      return

    }

    if (!message) {

      alert("Please provide rejection reason")

      return

    }

    try {

      const response = await fetch(
        "/api/admin/reject-request",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            student_id: studentId,

            admin_message: message

          })

        }
      )

      const result = await response.json()

      if (result.success) {

        alert("Request rejected")

        setMessage("")

        fetchRequests()

        fetchUnapprovedStudents()

      } else {

        alert(result.message)

      }

    } catch (error) {

      console.error(error)

    }

  }

  // =========================================================
  // FETCH UNAPPROVED STUDENTS
  // =========================================================

  const fetchUnapprovedStudents = async () => {

    try {

      const response = await fetch(
        "/api/admin/unapproved-students"
      )

      const result = await response.json()

      if (result.success) {

        setUnapprovedStudents(result.students)

      }

    } catch (error) {

      console.error(error)

    }

    if (!canManageUsers) {

      alert("You do not have permission to manage admin users")

      return

    }

  }

  // =========================================================
  // MARK CERTIFICATE COLLECTED
  // =========================================================

  const markCollected = async (studentId) => {

    if (!canManageRequests) {

      alert("You do not have permission to update collection status")

      return

    }

    const signature = window.prompt(
      "Enter collector name or signature note"
    )

    if (signature === null) return

    const confirmCollect = window.confirm(
      "Mark this certificate as collected?"
    )

    if (!confirmCollect) return

    try {

      const response = await fetch(
        "/api/admin/mark-collected",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            student_id: studentId,
            signature

          })
        }
      )

      const result = await response.json()

      if (result.success) {

        alert("Certificate marked as collected")

        fetchStudents()
        fetchApprovedStudents()

      } else {

        alert(result.message)
      }

    } catch (error) {

      console.error(error)

      alert("Failed to update collection status")
    }
  }

  const matchesSearch = (student, searchValue) => {

    const value = searchValue.trim().toLowerCase()

    if (!value) return true

    return [
      student.full_name,
      student.student_id,
      student.email,
      student.faculty,
      student.programme,
      student.request_status,
      student.admin_message
    ]
      .filter(Boolean)
      .some((field) =>
        field.toString().toLowerCase().includes(value)
      )
  }

  const filteredStudents = students.filter((student) =>
    matchesSearch(student, studentSearch)
  )

  const filteredRequests = requests.filter((student) =>
    matchesSearch(student, requestSearch)
  )

  const filteredApprovedStudents = approvedStudents.filter((student) =>
    matchesSearch(student, approvedSearch)
  )

  const filteredUnapprovedStudents = unapprovedStudents.filter((student) =>
    matchesSearch(student, unapprovedSearch)
  )

  return (

    <div className="admin-page">

      {/* =========================================================
          MOBILE TOGGLE
      ========================================================= */}

      <div
        className="admin-toggle"
        onClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
      >

        <Icon name={sidebarOpen ? "close" : "menu"} />

      </div>

      {/* =========================================================
          SIDEBAR
      ========================================================= */}

      <aside
        className={
          sidebarOpen
            ? "admin-sidebar admin-open"
            : "admin-sidebar"
        }

        style={{
          backgroundImage: `url(${bgImage})`
        }}
      >

        <div className="admin-overlay"></div>

        <div className="admin-content">

          {/* =========================================================
              TOP
          ========================================================= */}

          <div className="admin-top">

            <h2>
              ADMIN PANEL
            </h2>

            <p>
              Certificate Verification System
            </p>

            <small className="admin-signed-in">
              {JSON.parse(localStorage.getItem("admin") || "{}").email}
            </small>

            <small className="admin-permission-label">
              {isSuperAdmin
                ? "Super Admin"
                : `${currentPermissions.length} permissions`}
            </small>

          </div>

          {/* =========================================================
              MENU
          ========================================================= */}

          <div className="admin-menu">

            {/* REGISTERED STUDENTS */}
            <div
              className={
                activeTab === "students"
                  ? "admin-item active-admin"
                  : "admin-item"
              }

              onClick={() =>
                setActiveTab("students")
              }
            >

              <Icon name="users" />

              <p>
                Registered Students
              </p>

            </div>

            {/* CERTIFICATE REQUESTS */}
            {canManageRequests && (
            <div
              className={
                activeTab === "requests"
                  ? "admin-item active-admin"
                  : "admin-item"
              }

              onClick={() =>
                setActiveTab("requests")
              }
            >

              <Icon name="document" />

              <p>
                Certificate Requests
              </p>

            </div>
            )}

            {/* APPROVED STUDENTS */}
            {canManageApproved && (
            <div
              className={
                activeTab === "approved"
                  ? "admin-item active-admin"
                  : "admin-item"
              }

              onClick={() =>
                setActiveTab("approved")
              }
            >

              <Icon name="check" />

              <p>
                Approved Students
              </p>

            </div>
            )}

            {/* UNAPPROVED STUDENTS */}
            {canManageApproved && (
            <div
              className={
                activeTab === "unapproved"
                  ? "admin-item active-admin"
                  : "admin-item"
              }

              onClick={() =>
                setActiveTab("unapproved")
              }
            >

              <Icon name="x" />

              <p>
                Unapproved Students
              </p>

            </div>
            )}

            {/* MANAGE USERS */}
            {canManageUsers && (
            <div
              className={
                activeTab === "users"
                  ? "admin-item active-admin"
                  : "admin-item"
              }

              onClick={() =>
                setActiveTab("users")
              }
            >

              <Icon name="user" />

              <p>
                Manage Users
              </p>

            </div>
            )}

          </div>

          <button
            className="admin-logout-btn"
            onClick={handleAdminLogout}
          >
            Logout
          </button>

        </div>

      </aside>

      {/* =========================================================
          MAIN SECTION
      ========================================================= */}

      <main className="admin-main">

        {/* =========================================================
            REGISTERED STUDENTS TAB
        ========================================================= */}

        {activeTab === "students" && canViewStudents && (

          <>

            <div className="admin-header">

              <div>

                <h1>
                  Registered Students
                </h1>

                <p>
                  All registered students
                </p>

              </div>

            </div>

            <div className="table-card">

              <div className="table-top">

                <h3>
                  Student Records
                </h3>

                <div className="student-count">

                  {filteredStudents.length} Students

                </div>

              </div>

              <input
                className="admin-search"
                type="search"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) =>
                  setStudentSearch(e.target.value)
                }
              />

              {loading ? (

                <div className="loading-box">

                  Loading students...

                </div>

              ) : (

                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>Photo</th>
                        <th>Full Name</th>
                        <th>Student ID</th>
                        <th>Email</th>
                        <th>Faculty</th>
                        <th>Programme</th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredStudents.map((student, index) => (

                        <tr key={index}>

                          <td>

                            <img
                              src={apiUrl(`/api/student-image/${student.face_image}`)}
                              alt="student"
                              className="student-image"
                            />

                          </td>

                          <td>
                            {student.full_name}
                          </td>

                          <td>
                            {student.student_id}
                          </td>

                          <td>
                            {student.email}
                          </td>

                          <td>
                            {student.faculty}
                          </td>

                          <td>
                            {student.programme}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>

        )}

        {/* =========================================================
            CERTIFICATE REQUEST TAB
        ========================================================= */}

        {activeTab === "requests" && canManageRequests && (

          <>

            <div className="admin-header">

              <div>

                <h1>
                  Certificate Requests
                </h1>

                <p>
                  Review and approve requests
                </p>

              </div>

            </div>

            <div className="table-card">

              <div className="table-top">

                <h3>
                  Pending Requests
                </h3>

                <div className="student-count">

                  {filteredRequests.length} Requests

                </div>

              </div>

              <input
                className="admin-search"
                type="search"
                placeholder="Search pending requests..."
                value={requestSearch}
                onChange={(e) =>
                  setRequestSearch(e.target.value)
                }
              />

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Programme</th>
                      <th>Request Date</th>
                      <th>Schedule Date</th>
                      <th>Message</th>
                      <th>Actions</th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredRequests.map((student, index) => (

                      <tr key={index}>

                        <td>
                          {student.full_name}
                        </td>

                        <td>
                          {student.student_id}
                        </td>

                        <td>
                          {student.programme}
                        </td>

                        <td>
                          {student.request_date}
                        </td>

                        <td>

                          <input
                            type="date"
                            value={approvedDate}
                            onChange={(e) =>
                              setApprovedDate(
                                e.target.value
                              )
                            }
                          />

                        </td>

                        <td>

                          <textarea
                            placeholder="Admin message..."
                            value={message}
                            onChange={(e) =>
                              setMessage(
                                e.target.value
                              )
                            }
                          />

                        </td>

                        <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

                          <button
                            className="approve-btn"
                            title="Approve Student"

                            onClick={() =>
                              approveStudent(
                                student.student_id
                              )
                            }
                          >
                            
                            <Icon name="check" />

                          </button>

                          <button
                            className="reject-btn"
                            title="Reject Student"

                            onClick={() =>
                              rejectStudent(
                                student.student_id
                              )
                            }
                          >
                            
                          <Icon name="x" />

                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}

        {/* =========================================================
            APPROVED STUDENTS TAB
        ========================================================= */}

        {activeTab === "approved" && canManageApproved && (

          <>

            <div className="admin-header">

              <div>

                <h1>
                  Approved Students
                </h1>

                <p>
                  Successfully approved certificate requests
                </p>

              </div>

            </div>

            <div className="table-card">

              <div className="table-top">

                <h3>
                  Approved List
                </h3>

                <div className="student-count">

                  {filteredApprovedStudents.length} Approved

                </div>

              </div>

              <input
                className="admin-search"
                type="search"
                placeholder="Search approved students..."
                value={approvedSearch}
                onChange={(e) =>
                  setApprovedSearch(e.target.value)
                }
              />

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>Full Name</th>
                      <th>Student ID</th>
                      <th>Programme</th>
                      <th>Status</th>
                      <th>Approved Date</th>
                      <th>Collection Date</th>
                      <th>Collected At</th>
                      <th>Signature</th>
                      <th>Action</th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredApprovedStudents.map((student, index) => (

                      <tr key={index}>

                        <td>
                          {student.full_name}
                        </td>

                        <td>
                          {student.student_id}
                        </td>

                        <td>
                          {student.programme}
                        </td>

                        <td>

                          <span
                            className={
                              student.certificate_collected
                                ? "collected-badge"
                                : "approved-badge"
                            }
                          >

                            {student.certificate_collected
                              ? "Collected"
                              : "Approved"}

                          </span>

                        </td>

                        <td>
                          {student.approved_date}
                        </td>

                        <td>
                          {student.collection_date || "Not scheduled"}
                        </td>

                        <td>
                          {student.collected_at || "Not collected"}
                        </td>

                        <td>
                          {student.signature || "-"}
                        </td>

                        <td>
                          {student.certificate_collected ? (

                            <span className="collected-text">
                              Completed
                            </span>

                          ) : (

                            <button
                              className="collect-btn"
                              onClick={() =>
                                markCollected(student.student_id)
                              }
                            >
                              Mark collected
                            </button>

                          )}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}

        {/* =========================================================
            UNAPPROVED STUDENTS TAB
        ========================================================= */}

        {activeTab === "unapproved" && canManageApproved && (

          <>

            <div className="admin-header">

              <div>

                <h1>
                  Unapproved Students
                </h1>

                <p>
                  Rejected requests that can be reviewed again
                </p>

              </div>

            </div>

            <div className="table-card">

              <div className="table-top">

                <h3>
                  Rejected List
                </h3>

                <div className="student-count">

                  {filteredUnapprovedStudents.length} Unapproved

                </div>

              </div>

              <input
                className="admin-search"
                type="search"
                placeholder="Search unapproved students..."
                value={unapprovedSearch}
                onChange={(e) =>
                  setUnapprovedSearch(e.target.value)
                }
              />

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Programme</th>
                      <th>Rejected Message</th>
                      <th>Schedule Date</th>
                      <th>New Message</th>
                      <th>Action</th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredUnapprovedStudents.map((student, index) => (

                      <tr key={index}>

                        <td>
                          {student.full_name}
                        </td>

                        <td>
                          {student.student_id}
                        </td>

                        <td>
                          {student.programme}
                        </td>

                        <td>
                          {student.admin_message || "-"}
                        </td>

                        <td>

                          <input
                            type="date"
                            value={approvedDate}
                            onChange={(e) =>
                              setApprovedDate(
                                e.target.value
                              )
                            }
                          />

                        </td>

                        <td>

                          <textarea
                            placeholder="New approval message..."
                            value={message}
                            onChange={(e) =>
                              setMessage(
                                e.target.value
                              )
                            }
                          />

                        </td>

                        <td>

                          <button
                            className="approve-again-btn"
                            onClick={() =>
                              approveStudent(
                                student.student_id
                              )
                            }
                          >
                            Approve
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}

        {/* =========================================================
            MANAGE USERS TAB
        ========================================================= */}

        {activeTab === "users" && canManageUsers && (

          <>

            <div className="admin-header">

              <div>

                <h1>
                  Manage Admin Users
                </h1>

                <p>
                  Add or remove admin users
                </p>

              </div>

            </div>

            {/* CREATE USER CARD */}

            <div className="create-user-card">

              <h3>
                Create Admin User
              </h3>

              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
              />

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
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowAdminPassword(!showAdminPassword)
                  }
                >
                  {showAdminPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="permissions-box">

                <h4>
                  Permissions
                </h4>

                <label>
                  <input
                    type="checkbox"
                    checked={permissions.includes("view_students")}
                    readOnly
                  />
                  View Registered Students
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={permissions.includes("manage_requests")}
                    onChange={() =>
                      togglePermission("manage_requests")
                    }
                  />
                  Manage Certificate Requests (Approve/Reject)
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={permissions.includes("manage_approved")}
                    onChange={() =>
                      togglePermission("manage_approved")
                    }
                  />
                  Manage Approved/Unapproved Students
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={permissions.includes("manage_users")}
                    onChange={() =>
                      togglePermission("manage_users")
                    }
                  />
                  Manage Users
                </label>

              </div>

              <button
                className="create-btn"
                onClick={handleCreateUser}
              >
                Create User
              </button>

            </div>

            {/* USERS TABLE */}

            <div className="table-card">

              <div className="table-top">

                <h3>
                  Admin Users
                </h3>

              </div>

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Permissions</th>
                      <th>Created</th>
                      <th>Action</th>

                    </tr>

                  </thead>

                  <tbody>

                    {adminUsers.map((user) => (

                      <tr key={user.id}>

                        <td>
                          {user.full_name}
                        </td>

                        <td>
                          {user.email}
                        </td>

                        <td>
                          <div className="permission-tags">
                            {(user.permissions || ["view_students"]).map(
                              (permission) => (
                                <span
                                  key={permission}
                                  className="permission-tag"
                                >
                                  {permission.replace("_", " ")}
                                </span>
                              )
                            )}
                          </div>
                        </td>

                        <td>
                          {user.created_at}
                        </td>

                        <td>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteUser(user.id)
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}

      </main>

    </div>

  )

}

export default AdminDashboard

