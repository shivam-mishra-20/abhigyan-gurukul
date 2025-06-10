/* eslint-disable react/prop-types */

/* eslint-disable react/react-in-jsx-scope */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router";
import { useMediaQuery } from "react-responsive";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingLeaderboardButton from "./components/FloatingLeaderboardButton";
import trackVisit from "./utils/trackVisit";

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

// TrackingWrapper component to handle visit tracking on route changes
const TrackingWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Track page visit when route changes
    trackVisit();
  }, [location.pathname]);

  return <>{children}</>;
};

function App() {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <Router>
      <TrackingWrapper>
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
                <Routes>
                  <Route path="/" element={<StudentDashboard />} />
                  {/* Add Traffic dashboard as a nested route within student-dashboard */}

                  {/* Add other nested routes if needed */}
                  <Route path="*" element={<StudentDashboard />} />
                </Routes>
              </ProtectedStudentRoute>
            }
          />
        </Routes>
        <hr className="mt-30 mb-30 border-t-1 border-black opacity-[18%] my-4" />
        <Footer />
        <FloatingLeaderboardButton />
      </TrackingWrapper>
    </Router>
  );
}

export default App;
