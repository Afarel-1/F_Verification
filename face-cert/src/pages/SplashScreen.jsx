import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import appLogo from "../assets/facial logo.png"

function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth")
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash-screen">
      <div className="splash-content">

        <div className="splash-logo">
          <img
            src={appLogo}
            alt="Pentvars Certificate Verification"
          />
        </div>

        <h1>Pentvars Certificate Verification</h1>

        <p>
          Secure Certificate Collection
        </p>

      </div>
    </div>
  )
}

export default SplashScreen
