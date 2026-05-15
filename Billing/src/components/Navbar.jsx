import React, { useEffect, useState } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import logo from "../assets/hari.png";

const Navbar = ({ isOpen }) => {

  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser || {});
    } catch {
      setUser({});
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");   // ✅ important
    window.location.href = "/";
  };

  return (
    <div className={`navbar ${isOpen ? "open" : "closed"}`}>

      {/* Left */}
      <div className="nav-left">
        <div className="brand">
          <img src={logo} alt="logo" />
          <div>
            <h3>Hari Billing</h3>
            <span className="sub">Billing Software</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="nav-right">
        <div className="user-box">
          <FaUserCircle className="user-icon" />

          <div>
            {/* ✅ FULL NAME */}
            <span className="user-name">
              {user.full_name || user.username || "User"}
            </span>

            {/* ✅ ROLE */}
            <span className="user-role">
              {user.role || "Role"}
            </span>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

    </div>
  );
};

export default Navbar;