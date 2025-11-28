import React from "react";
import { Route, Routes } from "react-router";
import { publicRoutes, protectedRoutes } from "./router.link";

import Feature from "../feature";             // Layout for authenticated pages
import AuthFeature from "../authFeature";     // Layout for login/register pages
import ProtectedRoute from "../../core/auth/ProtectedRoute";

const Router = () => {
  return (
    <Routes>

      {/* 🔹 PUBLIC ROUTES (Login / Register / Forgot Password / Verification) */}
      <Route element={<AuthFeature />}>
        {publicRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>

      {/* 🔹 PROTECTED ROUTES (Dashboard / HRM / Payroll / Admin / Settings) */}
      <Route element={<ProtectedRoute />}>
        {protectedRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={
              <Feature>
                {route.element}
              </Feature>
            }
          />
        ))}
      </Route>

    </Routes>
  );
};

export default Router;
