import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/hari.png";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ✅ LOGIN FUNCTION INSIDE COMPONENT
  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // ✅ STORE DATA
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("menus", JSON.stringify(data.menus));

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        timer: 1200,
        showConfirmButton: false,
      });

      setTimeout(() => {
  // ✅ Get user role
  const role = data.user?.role;

  // ✅ If cashier or shop_staff → billing
  if (role === "Cashier" || role === "shop_staff") {
    navigate("/billing");
  } else {
    // ✅ Other users → dashboard
    navigate("dashboard");
  }
}, 1200);

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err.message,
      });
    }
  };

  return (
    <div className="login-wrapper">

      {/* LEFT */}
      <div className="login-left">
        <img src={logo} alt="logo" className="login-logo" />
        <h2>Hari Billing System</h2>
        <p>Smart POS & Business Management</p>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="login-box">

          <h3>Welcome Back</h3>
          <p className="sub-text">Login to continue</p>

          <input
            type="text"
            placeholder="Username"
            className="form-control mb-3"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <div style={{ position: "relative" }}>

  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    className="form-control mb-3"
    value={form.password}
    onChange={(e) =>
      setForm({ ...form, password: e.target.value })
    }
  />

  {/* 👁 Eye Icon */}
  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      fontSize: "18px",
    }}
  >
    {showPassword ? "🙈" : "👁️"}
  </span>

</div>

          <button className="login-btn" onClick={handleLogin}>
            🔐 Sign In
          </button>

          <div className="demo">Demo: admin / 1234</div>

        </div>
      </div>

    </div>
  );
};

export default Login;