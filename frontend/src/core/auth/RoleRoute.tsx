// frontend/src/core/auth/RoleRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getToken, decodeJwt } from "./auth";
import API from "../../api/axios";

type RoleRouteProps = {
  children: JSX.Element;
  allowedRoles: string[]; // e.g. ["admin","hr"]
  loginPath?: string;
  forbiddenPath?: string; // where to send when role not allowed
};

/**
 * RoleRoute tries:
 * 1) decode JWT and check claims for role/is_staff/is_superuser
 * 2) if not present, it will try a backend call to /api/users/me/ to fetch role (if exists)
 *
 * Adjust the backend URL '/api/users/me/' if your API uses a different path.
 */
const RoleRoute = ({ children, allowedRoles, loginPath = "/login", forbiddenPath = "/" }: RoleRouteProps) => {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = getToken();
      if (!token) {
        setAllowed(false);
        setChecked(true);
        return;
      }

      // 1) Try decode JWT payload
      const payload: any = decodeJwt(token);
      if (payload) {
        // common claims: is_staff, is_superuser, role, user_type
        const roleClaim = payload.role || payload.user_type || null;
        if (roleClaim && allowedRoles.includes(String(roleClaim))) {
          setAllowed(true);
          setChecked(true);
          return;
        }
        if (payload.is_staff || payload.is_superuser) {
          // treat staff/superuser as admin
          if (allowedRoles.includes("admin") || allowedRoles.includes("hr")) {
            setAllowed(true);
            setChecked(true);
            return;
          }
        }
      }

      // 2) Fallback: call backend user-info endpoint if available
      try {
        const resp = await API.get("/users/me/"); // change if your endpoint differs
        const user = resp.data;
        // look for role-like fields
        const r = user.role || user.user_type || (user.is_staff ? "admin" : user.is_employee ? "employee" : null);
        if (r && allowedRoles.includes(String(r))) {
          setAllowed(true);
        } else if (user.is_staff || user.is_superuser) {
          if (allowedRoles.includes("admin") || allowedRoles.includes("hr")) setAllowed(true);
        } else {
          setAllowed(false);
        }
      } catch (err) {
        // endpoint not available or failed; fall back to what we decoded
        // leave allowed as false
      } finally {
        setChecked(true);
      }
    };
    check();
  }, [allowedRoles]);

  if (!checked) return null; // or a spinner if you have one

  const token = getToken();
  if (!token) return <Navigate to={loginPath} replace />; // not authenticated

  if (!allowed) return <Navigate to={forbiddenPath} replace />; // authenticated but not allowed

  return children;
};

export default RoleRoute;
