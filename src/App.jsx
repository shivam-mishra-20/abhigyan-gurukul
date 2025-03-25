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

// Mobile Version of Home Page
import MobileHome from "./pages/MobileHome";

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
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
