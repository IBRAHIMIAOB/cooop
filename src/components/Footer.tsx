import React, { useContext } from 'react';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';
import './Footer.css';


const linkStyle = {
  listStyle: 'none', 
  display: 'flex',      
  gap: '15px',         
  padding: '0',        
  margin: '0',         

};

const linkItemStyle = {
  background: 'linear-gradient(to right, #007bff, #00c6ff)',
  color: 'white', 
  padding: '0',        
  margin: '0',         

};


const Footer: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{t.footer.about}</h3>
            <p>{t.footer.aboutText}</p>
          </div>
          <div className="footer-section">
            <h3>{t.footer.contact}</h3>
            <p>{t.footer.contactText}</p>
            <p>Email: contact@cooop.com</p>
          </div>
          <div className="footer-section">
            <h3>{t.footer.links}</h3>
            <ul style={linkStyle}>
              <li style={linkItemStyle} className="footer-link-item"><a href="/experiences">{t.footer.experiences}</a></li>
              <li style={linkItemStyle} className="footer-link-item"><a href="/opportunities">{t.footer.opportunities}</a></li>
              <li style={linkItemStyle} className="footer-link-item"><a href="/about">{t.footer.aboutUs}</a></li>
              <li style={linkItemStyle} className="footer-link-item"><a href="/donate">{t.footer.donate}</a></li>
            </ul>

          
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Cooop. {t.footer.rights}</p>
          <p>
            {t.footer.createdBy}: Ibrahim Alobaid & Nawaf Almarshad
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
