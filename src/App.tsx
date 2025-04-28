import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Experiences from './pages/Experiences';
import About from './pages/About';
import Donate from './pages/Donate';
import ExperienceForm from './components/ExperienceForm';
import LanguageContext from './contexts/LanguageContext';

function App() {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [userType, setUserType] = useState<'regular' | 'root' | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
        <Router>
          <div className={`App ${language === 'ar' ? 'rtl' : 'ltr'}`}>
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Experiences />} />
                <Route path="/experiences" element={<Experiences />} />
                <Route path="/about" element={<About />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/submit-experience" element={<ExperienceForm />} />
                <Route 
                  path="/admin/dashboard" 
                  
                  
                />
                
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
    </LanguageContext.Provider>
  );
}

export default App;
