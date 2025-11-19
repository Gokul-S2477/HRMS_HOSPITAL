// frontend/src/core/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "./auth";

type Props = {
  children: JSX.Element;
  loginPath?: string;
};

const ProtectedRoute = ({ children, loginPath = "/login" }: Props) => {
  const token = getToken();
  if (!token) {
    // not authenticated -> go to login
    return <Navigate to={loginPath} replace />;
  }
  return children;
};

export default ProtectedRoute;
