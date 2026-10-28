import { Navigate, useLocation } from "react-router-dom";

function isTokenExpired(token) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(normalized));
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function ProtectedRoute({ role, children }) {
  const location = useLocation();
  const token = localStorage.getItem("startupsync_token");

  let user = null;
  try {
    const storedUser = localStorage.getItem("startupsync_user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const normalizedRole = String(role || "").toLowerCase();
  const userRole = String(user?.role || "").toLowerCase();
  const tokenInvalid = !token || isTokenExpired(token);

  if (tokenInvalid || !user || !userRole) {
    if (tokenInvalid) {
      localStorage.removeItem("startupsync_token");
      localStorage.removeItem("startupsync_user");
    }
    const loginPath = normalizedRole ? `/login/${normalizedRole}` : "/login";
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (normalizedRole && userRole !== normalizedRole) {
    const safeRole = ["founder", "investor", "mentor", "student", "admin"].includes(userRole)
      ? userRole
      : "";
    return <Navigate to={safeRole ? `/dashboard/${safeRole}` : "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;
