import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "Admin") return <Navigate to="/" replace />;
  return children;
}
