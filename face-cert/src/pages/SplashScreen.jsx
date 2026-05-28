import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="splash-screen">
      <div className="splash-content">

        <div className="splash-logo">
          FV
        </div>

        <h1>Face Verification System</h1>

        <p>
          Secure Certificate Collection & Student Verification
        </p>

      </div>
    </div>
  )
}

export default SplashScreen