import React, { useContext, useState, useEffect } from 'react';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';
import { Link } from 'react-router-dom';

const Experiences: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    university: '',
    college: '',
    major: '',
    company: '',
    recommended: false,
    contracted: false
  });
  
  // Options for filters
  const [universities, setUniversities] = useState<string[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  
  const fetchExperiences = async (pageNum = 1, resetList = false) => {
    setLoading(true);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '15');
      
      if (filters.university) queryParams.append('university', filters.university);
      if (filters.college) queryParams.append('college', filters.college);
      if (filters.major) queryParams.append('major', filters.major);
      if (filters.company) queryParams.append('company', filters.company);
      if (filters.recommended) queryParams.append('recommended', 'true');
      if (filters.contracted) queryParams.append('contracted', 'true');
      console.log(new URL(`/api/Get_experiences.php?${queryParams.toString()}`, 'https://ibrahimalobaid.me').href);
      console.log("HELLLO")
      const response = await fetch(new URL(`/api/Get_experiences.php?${queryParams.toString()}`, 'https://ibrahimalobaid.me').href);
      const data = await response.json();
      
      if (response.ok) {
        if (resetList) {
          setExperiences(data.data);
        } else {
          setExperiences(prev => [...prev, ...data.data]);
        }
        
        setHasMore(data.pagination.page * data.pagination.limit < data.pagination.total);
        setPage(pageNum);
      } else {
        setError(data.message || t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch filter options
  const fetchFilterOptions = async () => {
    // In a real implementation, these would come from API endpoints
    // For now, we'll use mock data
    setUniversities([
      'King Saud University',
      'King Abdulaziz University',
      'King Fahd University of Petroleum and Minerals',
      'King Khalid University',
      'Imam Abdulrahman Bin Faisal University'
    ]);
    
    setColleges([
      'College of Computer and Information Sciences',
      'College of Engineering',
      'College of Business Administration',
      'College of Science',
      'College of Medicine'
    ]);
    
    setMajors([
      'Computer Science',
      'Information Technology',
      'Software Engineering',
      'Computer Engineering',
      'Information Systems'
    ]);
    
    setCompanies([
      'Saudi Aramco',
      'SABIC',
      'STC',
      'Mobily',
      'NCB'
    ]);
  };
  
  useEffect(() => {
    fetchExperiences(1, true);
    fetchFilterOptions();
  }, []);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: checked }));
  };
  
  const applyFilters = () => {
    fetchExperiences(1, true);
  };
  
  const resetFilters = () => {
    setFilters({
      university: '',
      college: '',
      major: '',
      company: '',
      recommended: false,
      contracted: false
    });
    fetchExperiences(1, true);
  };
  
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchExperiences(page + 1);
    }
  };
  
  return (
    <div className="experiences-container">
      <h1>{t.experiences.title}</h1>
      <p className="subtitle">{t.experiences.subtitle}</p>
      
      <div className="filter-section card">
        <div className="card-body">
          <h3>{t.experiences.filter}</h3>
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="university">{t.experiences.university}</label>
                <select
                  id="university"
                  name="university"
                  className="form-control"
                  value={filters.university}
                  onChange={handleFilterChange}
                >
                  <option value="">{t.common.all}</option>
                  {universities.map((university, index) => (
                    <option key={index} value={university}>{university}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="college">{t.experiences.college}</label>
                <select
                  id="college"
                  name="college"
                  className="form-control"
                  value={filters.college}
                  onChange={handleFilterChange}
                >
                  <option value="">{t.common.all}</option>
                  {colleges.map((college, index) => (
                    <option key={index} value={college}>{college}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="major">{t.experiences.major}</label>
                <select
                  id="major"
                  name="major"
                  className="form-control"
                  value={filters.major}
                  onChange={handleFilterChange}
                >
                  <option value="">{t.common.all}</option>
                  {majors.map((major, index) => (
                    <option key={index} value={major}>{major}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="company">{t.experiences.company}</label>
                <select
                  id="company"
                  name="company"
                  className="form-control"
                  value={filters.company}
                  onChange={handleFilterChange}
                >
                  <option value="">{t.common.all}</option>
                  {companies.map((company, index) => (
                    <option key={index} value={company}>{company}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="row mt-3">
            <div className="col-md-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="recommended"
                  name="recommended"
                  className="form-check-input"
                  checked={filters.recommended}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="recommended">
                  {t.experiences.recommended}
                </label>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="contracted"
                  name="contracted"
                  className="form-check-input"
                  checked={filters.contracted}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="contracted">
                  {t.experiences.contracted}
                </label>
              </div>
            </div>
            
            <div className="col-md-6 text-right">
              <button className="btn btn-secondary mr-2" onClick={resetFilters}>
                {t.common.reset}
              </button>
              <button className="btn btn-primary" onClick={applyFilters}>
                {t.common.filter}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="action-buttons mt-4 mb-4">
        <Link to="/submit-experience" className="btn btn-primary">
          {t.experiences.shareExperience}
        </Link>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {experiences.length === 0 && !loading ? (
        <div className="alert alert-info">{t.experiences.noExperiences}</div>
      ) : (
        <div className="experiences-list">
          {experiences.map((experience, index) => (
            <div key={index} className="card experience-card mb-4">
              <div className="card-header">
                <h3>{experience.company_name}</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>{t.experiences.university}:</strong> {experience.university_name}</p>
                    <p><strong>{t.experiences.college}:</strong> {experience.college}</p>
                    <p><strong>{t.experiences.major}:</strong> {experience.major}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>{t.experiences.grade}:</strong> {experience.grade}/{experience.grade_scale} ({(experience.true_grade_scaler * 100).toFixed(2)}%)</p>
                    <p><strong>{t.experiences.duration}:</strong> {experience.duration} {t.experiences.weeks}</p>
                    <p>
                      <strong>{t.experiences.recommended}:</strong> {experience.recommended ? t.common.yes : t.common.no}
                      {experience.recommended && experience.why_recommend && (
                        <span className="badge badge-success ml-2" title={experience.why_recommend}>
                          ?
                        </span>
                      )}
                    </p>
                    <p><strong>{t.experiences.contracted}:</strong> {experience.contracted ? t.common.yes : t.common.no}</p>
                  </div>
                </div>
                
                <div className="experience-details mt-3">
                  <h4>{t.experiences.tasks}</h4>
                  <p>{experience.tasks}</p>
                  
                  {experience.positives && (
                    <>
                      <h4>{t.experiences.positives}</h4>
                      <p>{experience.positives}</p>
                    </>
                  )}
                  
                  {experience.negatives && (
                    <>
                      <h4>{t.experiences.negatives}</h4>
                      <p>{experience.negatives}</p>
                    </>
                  )}
                  
                  {experience.additional_info && (
                    <>
                      <h4>{t.experiences.additionalInfo}</h4>
                      <p>{experience.additional_info}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="card-footer">
                <small className="text-muted">
                  {new Date(experience.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
          
          {hasMore && (
            <div className="text-center mt-4 mb-4">
              <button 
                className="btn btn-secondary" 
                onClick={loadMore} 
                disabled={loading}
              >
                {loading ? t.common.loading : t.experiences.loadMore}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Experiences;
