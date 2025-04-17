import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
// import Home from './pages/Home';
import Experiences from './pages/Experiences';
import Opportunities from './pages/Opportunities';
import About from './pages/About';
import Donate from './pages/Donate';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ExperienceForm from './components/ExperienceForm';
import OpportunityForm from './components/OpportunityForm';
import LanguageContext from './contexts/LanguageContext';
import AuthContext from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'regular' | 'root' | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const login = (username: string, type: 'regular' | 'root') => {
    setIsAuthenticated(true);
    setUserType(type);
    setUsername(username);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUsername(null);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <AuthContext.Provider value={{ isAuthenticated, userType, username, login, logout }}>
        <Router>
          <div className={`App ${language === 'ar' ? 'rtl' : 'ltr'}`}>
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Experiences />} />
                <Route path="/experiences" element={<Experiences />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/about" element={<About />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/submit-experience" element={<ExperienceForm />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/add-opportunity" 
                  element={
                    <ProtectedRoute>
                      <OpportunityForm />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
}

export default App;
