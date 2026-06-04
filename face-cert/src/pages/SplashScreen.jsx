import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

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

        <div className="splash-logo" aria-hidden="true">
          <svg
            viewBox="0 0 120 120"
            role="img"
            focusable="false"
          >
            <path
              className="logo-flame"
              d="M60 9c8 8-4 11-1 19 0 0-11-4-3-13 2-3 4-4 4-6Z"
            />
            <path
              className="logo-gold"
              d="M18 25v54l42 25 42-25V25L60 46 18 25Zm8 13 28 14v39L26 74V38Zm68 36L66 91V52l28-14v36Z"
            />
            <path
              className="logo-blue"
              d="M35 45v11l25 12V57L35 45Zm50 0L60 57v11l25-12V45ZM35 61v11l25 12V73L35 61Zm50 0L60 73v11l25-12V61Z"
            />
          </svg>
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
