import { useLocation, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function Certificate() {
  const location = useLocation()
  const navigate = useNavigate()

  const data = location.state

  // If accessed directly without data
  if (!data) {
    return (
      <>
        <Navbar />
        <div className="register-page">
          <div className="register-card">
            <h2>No Certificate Data Found</h2>
            <button
              className="register-btn"
              onClick={() => navigate("/register")}
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="certificate-page">
        <div className="certificate-card">

          <h1 className="certificate-title">
            CERTIFICATE OF REGISTRATION
          </h1>

          <div className="certificate-body">
            <img
              src={data.image}
              alt="Student"
              className="certificate-image"
            />

            <h2>{data.fullName}</h2>

            <p><strong>Student ID:</strong> {data.studentId}</p>
            <p><strong>Programme:</strong> {data.programme}</p>
            <p><strong>Duration:</strong> {data.duration}</p>
          </div>

          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            Register Another Student
          </button>

        </div>
      </div>

      <Footer />
    </>
  )
}

export default Certificate