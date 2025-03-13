import { BrowserRouter as Router, Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Faculties from "./pages/Faculties";
import Footer from "./components/Footer";
import EnrollNow from "./pages/EnrollNow";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/faculties" element={<Faculties />} />
        <Route path="/enrollnow" element={<EnrollNow />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
