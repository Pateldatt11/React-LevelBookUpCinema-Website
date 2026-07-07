import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Footer from './Components/Footer';
import Nav from './Components/Nav';
import Seo from './Components/Seo';
import Home from './Pages/Home';
import About from './Pages/About';
import Movies from './Pages/Movies';
import MovieDetails from './Pages/MovieDetails';
import Services from './Pages/Services';
import SeatSelection from './Pages/SeatSelection';
import Payment from './Pages/Payment';
import Ticket from './Pages/Ticket';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Forgetpass from './Pages/Forgetpass';
import ResetPassword from './Pages/ResetPassword';
import Profile from './Pages/Profile';
import ContactUs from './Pages/Contactus';
import ScrollToTop from './Components/ScrollToTop';




function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
    <Seo />
    <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/Movies" element={<Navigate to="/movies" replace />} />
        <Route path="/movie-details" element={<MovieDetails />} />
        <Route path="/movie-details/:movieSlug" element={<MovieDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/About" element={<Navigate to="/about" replace />} />
        <Route path="/services" element={<Services />} />
        <Route path="/Services" element={<Navigate to="/services" replace />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/Contact" element={<Navigate to="/contact" replace />} />
        <Route path="/seat-selection" element={<SeatSelection />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/Payment" element={<Navigate to="/payment" replace />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/Ticket" element={<Navigate to="/ticket" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Signup" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Login" element={<Navigate to="/login" replace />} />
        <Route path="/forgetpass" element={<Forgetpass />} />
        <Route path="/Forgetpass" element={<Navigate to="/forgetpass" replace />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Profile" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
       

     
      </Routes>


      <Footer />
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
