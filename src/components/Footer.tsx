import React, { useContext } from 'react';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';





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
            <ul >
              <li  className="btn"><a href="/experiences">{t.footer.experiences}</a></li>
              <li  className="btn"><a href="/opportunities">{t.footer.opportunities}</a></li>
              <li  className="btn"><a href="/about">{t.footer.aboutUs}</a></li>
              <li  className="btn"><a href="/donate">{t.footer.donate}</a></li>
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
