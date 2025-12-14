import { Navigate } from "react-router-dom";
import api from "../api/axios";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(() => setAuth(true))
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) return null;

  return auth ? children : <Navigate to="/login" />;
}
