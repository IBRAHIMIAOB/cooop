import React, { useContext, useState, useEffect } from 'react';
import LanguageContext from '../contexts/LanguageContext';
import AuthContext from '../contexts/AuthContext';
import translations from '../translations';

const Opportunities: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const { isAuthenticated } = useContext(AuthContext);
  const t = translations[language];
  
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    company: '',
    major: '',
    status: 'open'
  });
  
  // Options for filters
  const [majors, setMajors] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  
  const fetchOpportunities = async (pageNum = 1, resetList = false) => {
    setLoading(true);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '15');
      
      if (filters.company) queryParams.append('company', filters.company);
      if (filters.major) queryParams.append('major', filters.major);
      if (filters.status) queryParams.append('status', filters.status);
      
      const response = await fetch(`/api/opportunities?${queryParams.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        if (resetList) {
          setOpportunities(data.data);
        } else {
          setOpportunities(prev => [...prev, ...data.data]);
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
    fetchOpportunities(1, true);
    fetchFilterOptions();
  }, []);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    fetchOpportunities(1, true);
  };
  
  const resetFilters = () => {
    setFilters({
      company: '',
      major: '',
      status: 'open'
    });
    fetchOpportunities(1, true);
  };
  
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchOpportunities(page + 1);
    }
  };
  
  return (
    <div className="opportunities-container">
      <h1>{t.opportunities.title}</h1>
      <p className="subtitle">{t.opportunities.subtitle}</p>
      
      <div className="filter-section card">
        <div className="card-body">
          <h3>{t.opportunities.filter}</h3>
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="company">{t.opportunities.company}</label>
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
            
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="major">{t.opportunities.major}</label>
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
            
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="status">{t.opportunities.status}</label>
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="open">{t.opportunities.open}</option>
                  <option value="closed">{t.opportunities.closed}</option>
                  <option value="">{t.common.all}</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="row mt-3">
            <div className="col-md-12 text-right">
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
      
      {isAuthenticated && (
        <div className="action-buttons mt-4 mb-4">
          <a href="/admin/add-opportunity" className="btn btn-primary">
            {t.admin.dashboard.addOpportunity}
          </a>
        </div>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {opportunities.length === 0 && !loading ? (
        <div className="alert alert-info">{t.opportunities.noOpportunities}</div>
      ) : (
        <div className="opportunities-list">
          {opportunities.map((opportunity, index) => (
            <div key={index} className="card opportunity-card mb-4">
              <div className="card-header">
                <h3>{opportunity.company_name}</h3>
                <span className={`badge ${opportunity.status === 'open' ? 'badge-success' : 'badge-secondary'}`}>
                  {opportunity.status === 'open' ? t.opportunities.open : t.opportunities.closed}
                </span>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>{t.opportunities.major}:</strong> {opportunity.major_needed}</p>
                    {opportunity.salary > 0 && (
                      <p><strong>{t.opportunities.salary}:</strong> {opportunity.salary}</p>
                    )}
                    {opportunity.duration && (
                      <p><strong>{t.opportunities.duration}:</strong> {opportunity.duration}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <div className="job-description">
                      <h4>{t.opportunityForm.jobDescription}</h4>
                      <p>{opportunity.job_description}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {new Date(opportunity.upload_time).toLocaleDateString()}
                  </small>
                  {opportunity.url && opportunity.status === 'open' && (
                    <a href={opportunity.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      {t.opportunities.applyNow}
                    </a>
                  )}
                </div>
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

export default Opportunities;
