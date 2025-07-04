import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { authRoutes, publicRoutes } from "./router.link";
import Feature from "../feature";
import AuthFeature from "../authFeature";

// RequireAuth component for route protection
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const ALLRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<RequireAuth><Feature /></RequireAuth>}>
        {publicRoutes.map((route, idx) => (
          <Route path={route.path} element={route.element} key={idx} />
        ))}
      </Route>
      <Route element={<AuthFeature />}>
        {authRoutes.map((route, idx) => (
          <Route path={route.path} element={route.element} key={idx} />
        ))}
      </Route>
    </Routes>
  );
};

export default ALLRoutes;
