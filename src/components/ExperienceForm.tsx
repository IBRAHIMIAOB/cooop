import React, { useContext, useState, useEffect } from 'react';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';

interface ExperienceFormProps {
  onSubmit?: (success: boolean) => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ onSubmit }) => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    university_name: '',
    college: '',
    major: '',
    grade_scale: '5',
    grade: '',
    company_name: '',
    how_to_apply: '',
    salary: '0',
    duration: '',
    tasks: '',
    positives: '',
    negatives: '',
    recommended: false,
    why_recommend: '',
    additional_info: '',
    contracted: false
  });
  
  const [universities, setUniversities] = useState<string[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch universities, colleges, and majors for dropdown options
  useEffect(() => {
    // This would be replaced with actual API calls in production
    setUniversities([
      'King Saud University',
      'King Abdulaziz University',
      'King Fahd University of Petroleum and Minerals',
      'King Khalid University',
      'Imam Abdulrahman Bin Faisal University',
      'Qassim University',
      'Taibah University',
      'Taif University',
      'Jazan University',
      'University of Hail'
    ]);
    
    setColleges([
      'College of Computer and Information Sciences',
      'College of Engineering',
      'College of Business Administration',
      'College of Science',
      'College of Medicine',
      'College of Pharmacy',
      'College of Applied Medical Sciences',
      'College of Education',
      'College of Arts',
      'College of Law and Political Science'
    ]);
    
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
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    const formDataToSend = new FormData();
  
    // Convert form data to FormData, handling booleans
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        formDataToSend.append(key, value ? '1' : '0');
      } else {
        formDataToSend.append(key, value.toString());
      }
    });
  
    try {
      const response = await fetch('/api/experiences.php', {
        method: 'POST',
        body: formDataToSend, // Send as FormData
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setSuccess(true);
        setFormData({
          university_name: '',
          college: '',
          major: '',
          grade_scale: '5',
          grade: '',
          company_name: '',
          how_to_apply: '',
          salary: '0',
          duration: '',
          tasks: '',
          positives: '',
          negatives: '',
          recommended: false,
          why_recommend: '',
          additional_info: '',
          contracted: false,
        });
        onSubmit?.(true);
      } else {
        setError(result.error || t.common.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="experience-form-container">
      <h2>{t.experienceForm.title}</h2>
      <p className="subtitle">{t.experienceForm.subtitle}</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{t.experienceForm.success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="university_name" className="form-label">
                {t.experienceForm.universityName} <span className="required">*</span>
              </label>
              <select
                id="university_name"
                name="university_name"
                className="form-control"
                value={formData.university_name}
                onChange={handleChange}
                required
              >
                <option value="">{t.common.select}</option>
                {universities.map((university, index) => (
                  <option key={index} value={university}>{university}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="college" className="form-label">
                {t.experienceForm.college} <span className="required">*</span>
              </label>
              <select
                id="college"
                name="college"
                className="form-control"
                value={formData.college}
                onChange={handleChange}
                required
              >
                <option value="">{t.common.select}</option>
                {colleges.map((college, index) => (
                  <option key={index} value={college}>{college}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="major" className="form-label">
                {t.experienceForm.major} <span className="required">*</span>
              </label>
              <select
                id="major"
                name="major"
                className="form-control"
                value={formData.major}
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
          
          <div className="col-md-3">
            <div className="form-group">
              <label htmlFor="grade_scale" className="form-label">
                {t.experienceForm.gradeScale} <span className="required">*</span>
              </label>
              <select
                id="grade_scale"
                name="grade_scale"
                className="form-control"
                value={formData.grade_scale}
                onChange={handleChange}
                required
              >
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="form-group">
              <label htmlFor="grade" className="form-label">
                {t.experienceForm.grade} <span className="required">*</span>
              </label>
              <input
                type="number"
                id="grade"
                name="grade"
                className="form-control"
                value={formData.grade}
                onChange={handleChange}
                min="0"
                max={formData.grade_scale}
                step="0.01"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="company_name" className="form-label">
                {t.experienceForm.companyName} <span className="required">*</span>
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
              <label htmlFor="how_to_apply" className="form-label">
                {t.experienceForm.howToApply} <span className="required">*</span>
              </label>
              <select
                id="how_to_apply"
                name="how_to_apply"
                className="form-control"
                value={formData.how_to_apply}
                onChange={handleChange}
                required
              >
                <option value="">{t.common.select}</option>
                <option value="email">Email</option>
                <option value="website">Website</option>
                <option value="linkedin">LinkedIn</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="salary" className="form-label">
                {t.experienceForm.salary}
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
          
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="duration" className="form-label">
                {t.experienceForm.duration} <span className="required">*</span>
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                className="form-control"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="tasks" className="form-label">
            {t.experienceForm.tasks} <span className="required">*</span>
          </label>
          <textarea
            id="tasks"
            name="tasks"
            className="form-control"
            value={formData.tasks}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="positives" className="form-label">
            {t.experienceForm.positives}
          </label>
          <textarea
            id="positives"
            name="positives"
            className="form-control"
            value={formData.positives}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="negatives" className="form-label">
            {t.experienceForm.negatives}
          </label>
          <textarea
            id="negatives"
            name="negatives"
            className="form-control"
            value={formData.negatives}
            onChange={handleChange}
          />
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">
                {t.experienceForm.recommended}
              </label>
              <div>
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    name="recommended"
                    checked={formData.recommended}
                    onChange={handleCheckboxChange}
                  />
                  {t.experienceForm.yes}
                </label>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">
                {t.experienceForm.contracted}
              </label>
              <div>
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    name="contracted"
                    checked={formData.contracted}
                    onChange={handleCheckboxChange}
                  />
                  {t.experienceForm.yes}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {formData.recommended && (
          <div className="form-group">
            <label htmlFor="why_recommend" className="form-label">
              {t.experienceForm.whyRecommend}
            </label>
            <textarea
              id="why_recommend"
              name="why_recommend"
              className="form-control"
              value={formData.why_recommend}
              onChange={handleChange}
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="additional_info" className="form-label">
            {t.experienceForm.additionalInfo}
          </label>
          <textarea
            id="additional_info"
            name="additional_info"
            className="form-control"
            value={formData.additional_info}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t.common.loading : t.experienceForm.submit}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExperienceForm;
