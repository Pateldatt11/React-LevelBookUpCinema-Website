import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Footer from './Components/Footer';
import Nav from './Components/Nav';
import Home from './Pages/Home';
import About from './Pages/About';
import Movies from './Pages/Movies';
import Services from './Pages/Services';
import SeatSelection from './Pages/SeatSelection';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Forgetpass from './Pages/Forgetpass';
import Profile from './Pages/Profile';
import ContactUs from './Pages/Contactus';




function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Movies" element={<Movies />} />
        <Route path="/About" element={<About />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/Contact" element={<ContactUs />} />
        <Route path="/seat-selection" element={<SeatSelection />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Forgetpass" element={<Forgetpass />} />
        <Route path="/Profile" element={<Profile />} />
       

     
      </Routes>


      <Footer />
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
