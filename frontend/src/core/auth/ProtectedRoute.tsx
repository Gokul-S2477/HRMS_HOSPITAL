import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Fix: Add proper type for children
interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // If no login token → redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // IMPORTANT: Must return the children passed from router
  return <>{children}</>;
};

export default ProtectedRoute;
