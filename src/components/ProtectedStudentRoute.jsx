import { Navigate } from "react-router";

const ProtectedStudentRoute = ({ children, roles }) => {
  const userRole = localStorage.getItem("userRole");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Check if user has a name stored (indicates they completed login)
  const hasUserData = !!localStorage.getItem("studentName");

  // If not authenticated or missing required role, redirect to login
  if (
    !isAuthenticated ||
    !hasUserData ||
    (roles && !roles.includes(userRole))
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedStudentRoute;
