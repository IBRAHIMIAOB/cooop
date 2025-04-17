import React, { useContext, useState, useEffect } from 'react';
import LanguageContext from '../contexts/LanguageContext';
import AuthContext from '../contexts/AuthContext';
import translations from '../translations';

interface OpportunityFormProps {
  onSubmit?: (success: boolean) => void;
  opportunityId?: number; // For editing existing opportunity
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({ onSubmit, opportunityId }) => {
  const { language } = useContext(LanguageContext);
  const { isAuthenticated } = useContext(AuthContext);
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    company_name: '',
    major_needed: '',
    job_description: '',
    salary: '0',
    duration: '',
    status: 'open',
    url: ''
  });
  
  const [majors, setMajors] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch opportunity data if editing
  useEffect(() => {
    if (opportunityId) {
      const fetchOpportunity = async () => {
        try {
          const response = await fetch(`/api/opportunities/${opportunityId}`);
          const data = await response.json();
          
          if (response.ok) {
            setFormData({
              company_name: data.data.company_name,
              major_needed: data.data.major_needed,
              job_description: data.data.job_description,
              salary: data.data.salary.toString(),
              duration: data.data.duration,
              status: data.data.status,
              url: data.data.url || ''
            });
          } else {
            setError(data.message || t.common.error);
          }
        } catch (err) {
          setError(t.common.error);
        }
      };
      
      fetchOpportunity();
    }
  }, [opportunityId, t.common.error]);
  
  // Fetch majors for dropdown options
  useEffect(() => {
    // This would be replaced with actual API calls in production
    setMajors([
      'Computer Science',
      'Information Technology',
      'Software Engineering',
      'Computer Engineering',
      'Information Systems',
      'Artificial Intelligence',
      'Cybersecurity',
      'Data Science',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Industrial Engineering',
      'Business Administration',
      'Finance',
      'Marketing',
      'Accounting',
      'Human Resources Management'
    ]);
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError(t.common.unauthorized);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const url = opportunityId 
        ? `/api/opportunities/${opportunityId}` 
        : '/api/opportunities';
      
      const method = opportunityId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        if (!opportunityId) {
          setFormData({
            company_name: '',
            major_needed: '',
            job_description: '',
            salary: '0',
            duration: '',
            status: 'open',
            url: ''
          });
        }
        if (onSubmit) onSubmit(true);
      } else {
        setError(data.message || t.opportunityForm.error);
        if (onSubmit) onSubmit(false);
      }
    } catch (err) {
      setError(t.opportunityForm.error);
      if (onSubmit) onSubmit(false);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="opportunity-form-container">
      <h2>{opportunityId ? t.opportunityForm.editTitle : t.opportunityForm.title}</h2>
      <p className="subtitle">{t.opportunityForm.subtitle}</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{t.opportunityForm.success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="company_name" className="form-label">
                {t.opportunityForm.companyName} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                className="form-control"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="major_needed" className="form-label">
                {t.opportunityForm.majorNeeded} <span className="required">*</span>
              </label>
              <select
                id="major_needed"
                name="major_needed"
                className="form-control"
                value={formData.major_needed}
                onChange={handleChange}
                required
              >
                <option value="">{t.common.select}</option>
                {majors.map((major, index) => (
                  <option key={index} value={major}>{major}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="job_description" className="form-label">
            {t.opportunityForm.jobDescription} <span className="required">*</span>
          </label>
          <textarea
            id="job_description"
            name="job_description"
            className="form-control"
            value={formData.job_description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="row">
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="salary" className="form-label">
                {t.opportunityForm.salary}
              </label>
              <input
                type="number"
                id="salary"
                name="salary"
                className="form-control"
                value={formData.salary}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="duration" className="form-label">
                {t.opportunityForm.duration}
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                className="form-control"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 12 weeks"
              />
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                {t.opportunityForm.status} <span className="required">*</span>
              </label>
              <select
                id="status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="open">{t.opportunityForm.open}</option>
                <option value="closed">{t.opportunityForm.closed}</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="url" className="form-label">
            {t.opportunityForm.url}
          </label>
          <input
            type="url"
            id="url"
            name="url"
            className="form-control"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com/apply"
          />
        </div>
        
        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t.common.loading : opportunityId ? t.common.save : t.opportunityForm.submit}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OpportunityForm;
