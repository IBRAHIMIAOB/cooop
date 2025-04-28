import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';

const Header: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const t = translations[language];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>Cooop</h1>
          </Link>
        </div>
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/experiences">{t.header.experiences}</Link>
            </li>
            
            <li>
              <Link to="/about">{t.header.about}</Link>
            </li>
            <li>
              <Link to="/donate">{t.header.donate}</Link>
            </li>
            
          </ul>
        </nav>
        <div className="language-toggle">
          <button onClick={toggleLanguage} className="btn btn-secondary">
            {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
