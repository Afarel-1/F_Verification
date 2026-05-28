import { useNavigate, useLocation } from "react-router-dom"
import Icon from "./Icon"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === "/"

  return (
    <nav className="navbar">
      {/* Left side: Back arrow OR Logo */}
      <div className="nav-left">
        {!isHome && (
          <span
            className="back-arrow"
            onClick={() => navigate(-1)}
          >
            Back
          </span>
        )}

        <div
          className="logo clickable"
          onClick={() => navigate("/")}
        >
          LOGO
        </div>
      </div>

      {/* Right side: User icon */}
      <div className="user-icon">
        <Icon name="user" />
      </div>
    </nav>
  )
}

export default Navbar
