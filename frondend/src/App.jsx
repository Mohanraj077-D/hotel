import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import Details from "./pages/Details";
import Booking from "./pages/Booking";
import Manage from "./pages/Manage";
import AddHotel from "./pages/AddHotel";


function App() {
  return (
    <HelmetProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotel/:id" element={<Details />} />
        <Route path="/book/:id" element={<Booking />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/add-hotel" element={<AddHotel />} />
      </Routes>

      <Footer />
    </HelmetProvider>
  );
}

export default App;