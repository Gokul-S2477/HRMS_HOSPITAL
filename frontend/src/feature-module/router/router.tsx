import React from "react";
import { Route, Routes } from "react-router";
import { authRoutes, publicRoutes } from "./router.link";
import Feature from "../feature";
import AuthFeature from "../authFeature";
import ProtectedRoute from "../../core/auth/ProtectedRoute";

const ALLRoutes: React.FC = () => {
  return (
    <>
      <Routes>

        {/* Public Only: /auth/login */}
        <Route element={<Feature />}>
          {publicRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={route.element}
              key={idx}
            />
          ))}
        </Route>

        {/* All other routes (1500+ routes) are protected */}
        <Route element={<AuthFeature />}>
          {authRoutes.map((route, idx) => (
            <Route
              path={route.path}
              key={idx}
              element={
                <ProtectedRoute>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}
        </Route>

      </Routes>
    </>
  );
};

export default ALLRoutes;
