import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // ✅ Not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in
  return children;
};

export default ProtectedRoute;