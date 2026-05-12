// components/Navbar.jsx
import React from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import logo from "../assets/hari.png";
const logout = () => {
  localStorage.removeItem("isLoggedIn");
 window.location.href = "/";
};
const Navbar = ({ isOpen }) => {
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
            <span className="user-name">Nandhini</span>
            <span className="user-role">Cashier</span>
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