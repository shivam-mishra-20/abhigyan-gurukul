import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useMediaQuery } from "react-responsive";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Desktop Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Faculties from "./pages/Faculties";
import EnrollNow from "./pages/EnrollNow";
import AdminDashboard from "./pages/Admin";
import Login from "./pages/Login";
import StudentRegister from "./pages/StudentRegister";
import ProtectedStudentRoute from "./components/ProtectedStudentRoute";
import StudentDashboard from "./pages/StudentDashboard";
import DashboardAttendance from "./components/Page-Specific-Components/DashboardAttendance";

// Mobile Version of Home Page
import MobileHome from "./pages/MobileHome";
import StudentLogin from "./pages/StudentLogin";
import DashboardResult from "./components/Page-Specific-Components/DashboardResult";
import DashboardHome from "./pages/DashboardHome"; // ✅ use this one

// New Pages
import Admissions from "./pages/Admissions";
import Courses from "./pages/Courses";
import Events from "./pages/Events";

function App() {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Render "MobileHome" instead of "Home" on mobile */}
        <Route path="/" element={isMobile ? <MobileHome /> : <Home />} />

        <Route path="/about" element={<About />} />
        <Route path="/faculties" element={<Faculties />} />
        <Route path="/enrollnow" element={<EnrollNow />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/adminlogin" element={<Login />} />
        {/* <Route path="/verysecretregister" element={<StudentRegister />} /> */}
        <Route path="/login" element={<StudentLogin />} />

        {/* New Routes */}
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/events" element={<Events />} />

        {/* Protected student route */}
        <Route
          path="/student-dashboard/*"
          element={
            <ProtectedStudentRoute roles={["student", "teacher", "admin"]}>
              <StudentDashboard />
            </ProtectedStudentRoute>
          }
        />
      </Routes>
      <hr class="mt-30 mb-30 border-t-1 border-black opacity-[18%] my-4" />
      <Footer />
    </Router>
  );
}

export default App;
