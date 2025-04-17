import React, { useContext } from 'react';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';

const Donate: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  
  return (
    <div className="donate-container">
      <h1>{t.donate.title}</h1>
      <p className="subtitle">{t.donate.subtitle}</p>
      
      <div className="card mb-4">
        <div className="card-body">
          <p className="donate-text">{t.donate.text}</p>
          
          <div className="donate-options mt-4">
            <div className="row">
              <div className="col-md-4">
                <div className="donate-option">
                  <h3>10 SAR</h3>
                  <button className="btn btn-primary">{t.donate.button}</button>
                </div>
              </div>
              <div className="col-md-4">
                <div className="donate-option">
                  <h3>50 SAR</h3>
                  <button className="btn btn-primary">{t.donate.button}</button>
                </div>
              </div>
              <div className="col-md-4">
                <div className="donate-option">
                  <h3>100 SAR</h3>
                  <button className="btn btn-primary">{t.donate.button}</button>
                </div>
              </div>
            </div>
            
            <div className="custom-amount mt-4">
              <h3>{t.common.custom}</h3>
              <div className="input-group">
                <input type="number" className="form-control" placeholder="Enter amount" min="1" />
                <div className="input-group-append">
                  <button className="btn btn-primary">{t.donate.button}</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="thank-you mt-5 text-center">
            <h2>{t.donate.thanks}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
