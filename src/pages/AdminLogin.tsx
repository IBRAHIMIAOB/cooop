import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageContext from '../contexts/LanguageContext';
import AuthContext from '../contexts/AuthContext';
import translations from '../translations';

const AdminLogin: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.data.username, data.data.type);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || t.admin.login.error);
      }
    } catch (err) {
      setError(t.admin.login.error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-login-container">
      <div className="card login-card">
        <div className="card-header">
          <h2>{t.admin.login.title}</h2>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                {t.admin.login.username}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t.admin.login.password}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? t.common.loading : t.admin.login.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
