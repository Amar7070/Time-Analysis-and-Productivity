import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext";
import React from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");

  // While checking auth on refresh, show a spinner or nothing to prevent flashing login page
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // If no token exists, or if token exists but user fetch failed (invalid token)
  if (!token || (!loading && !user)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
