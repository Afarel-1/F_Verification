import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function Home() {
  const navigate = useNavigate()

  return (
    <>
      <Navbar />

      <main className="home">
        <div className="card-grid">

          {/* Registration Card */}
          <div
            className="card registration"
            onClick={() => navigate("/register")}
          >
            <div className="icon">📝</div>
            <h2>Registration</h2>
            <p>Register your face and personal details</p>
          </div>

          {/* Certificate Card */}
          <div
            className="card certificate"
            onClick={() => navigate("/certificate")}
          >
            <div className="icon">📜</div>
            <h2>Request Certificate</h2>
            <p>Verify your identity and get certified</p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}

export default Home
