const ProtectedStudentRoute = ({ children }) => {
  const userRole = localStorage.getItem("userRole");
  const email =
    localStorage.getItem("studentEmail") ||
    localStorage.getItem("teacherEmail") ||
    localStorage.getItem("adminEmail");

  if (!userRole || !email) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedStudentRoute;
