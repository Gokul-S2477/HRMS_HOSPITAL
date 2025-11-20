import React from "react";
import { Route, Routes } from "react-router";
import { authRoutes, publicRoutes, protectedRoutes } from "./router.link";
import Feature from "../feature";
import AuthFeature from "../authFeature";
import ProtectedRoute from "../../core/auth/ProtectedRoute";

const ALLRoutes: React.FC = () => {
  return (
    <Routes>

      {/* 🔹 PUBLIC ROUTES (Login, Register, Forgot Password) */}
      <Route element={<AuthFeature />}>
        {authRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>

      {/* 🔒 PROTECTED ROUTES (Dashboards + All 1500 pages) */}
      <Route element={<Feature />}>
        {protectedRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={
              <ProtectedRoute>
                {route.element}
              </ProtectedRoute>
            }
          />
        ))}

        {publicRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={
              <ProtectedRoute>
                {route.element}
              </ProtectedRoute>
            }
          />
        ))}
      </Route>

    </Routes>
  );
};

export default ALLRoutes;
