import React, { useContext } from 'react';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';

const About: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  
  return (
    <div className="about-container">
      <h1>{t.about.title}</h1>
      <p className="subtitle">{t.about.subtitle}</p>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>{t.about.mission}</h2>
        </div>
        <div className="card-body">
          <p>{t.about.missionText}</p>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>{t.about.vision}</h2>
        </div>
        <div className="card-body">
          <p>{t.about.visionText}</p>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>{t.about.team}</h2>
        </div>
        <div className="card-body">
          <p>{t.about.teamText}</p>
          <div className="team-members mt-4">
            <div className="row">
              <div className="col-md-6">
                <div className="team-member">
                  <h3>Ibrahim Alobaid</h3>
                  <p>Student ID: 443101143</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="team-member">
                  <h3>Nawaf Almarshad</h3>
                  <p>Student ID: 443101378</p>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
