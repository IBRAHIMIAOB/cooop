import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LanguageContext from '../contexts/LanguageContext';
import AuthContext from '../contexts/AuthContext';
import translations from '../translations';

const AdminDashboard: React.FC = () => {
  const { language } = useContext(LanguageContext);
  const { username, userType } = useContext(AuthContext);
  const t = translations[language];
  
  const [activeTab, setActiveTab] = useState<'experiences' | 'opportunities' | 'admins'>('experiences');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/experiences');
      const data = await response.json();
      
      if (response.ok) {
        setExperiences(data.data);
      } else {
        setError(data.message || t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/opportunities?status=');
      const data = await response.json();
      
      if (response.ok) {
        setOpportunities(data.data);
      } else {
        setError(data.message || t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAdmins = async () => {
    if (userType !== 'root') return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/list');
      const data = await response.json();
      
      if (response.ok) {
        setAdmins(data.data);
      } else {
        setError(data.message || t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeTab === 'experiences') {
      fetchExperiences();
    } else if (activeTab === 'opportunities') {
      fetchOpportunities();
    } else if (activeTab === 'admins') {
      fetchAdmins();
    }
  }, [activeTab]);
  
  const handleDeleteExperience = async (id: number) => {
    if (!window.confirm(t.admin.dashboard.confirmDelete)) return;
    
    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setExperiences(experiences.filter(exp => exp.id !== id));
      } else {
        const data = await response.json();
        setError(data.message || t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    }
  };
  
  const handleToggleExperienceStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
    
    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setExperiences(experiences.map(exp => 
          exp.id === id ? { ...exp, status: newStatus } : exp
        ));
      } else {
        const data = await response.json();
        setError(data.message || t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    }
  };
  
  const handleDeleteOpportunity = async (id: number) => {
    if (!window.confirm(t.admin.dashboard.confirmDelete)) return;
    
    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setOpportunities(opportunities.filter(opp => opp.id !== id));
      } else {
        const data = await response.json();
        setError(data.message || t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    }
  };
  
  const handleToggleOpportunityStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    
    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setOpportunities(opportunities.map(opp => 
          opp.id === id ? { ...opp, status: newStatus } : opp
        ));
      } else {
        const data = await response.json();
        setError(data.message || t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    }
  };
  
  const handleDeleteAdmin = async (adminUsername: string) => {
    if (userType !== 'root') return;
    if (!window.confirm(t.admin.dashboard.confirmDelete)) return;
    
    try {
      const response = await fetch(`/api/admin/delete/${adminUsername}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAdmins(admins.filter(admin => admin.username !== adminUsername));
      } else {
        const data = await response.json();
        setError(data.message || t.common.error);
      }
    } catch (err) {
      setError(t.common.error);
    }
  };
  
  return (
    <div className="admin-dashboard-container">
      <h1>{t.admin.dashboard.title}</h1>
      <p className="subtitle">{t.admin.dashboard.welcome}, {username}!</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="admin-tabs">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'experiences' ? 'active' : ''}`}
              onClick={() => setActiveTab('experiences')}
            >
              {t.admin.dashboard.experiences}
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'opportunities' ? 'active' : ''}`}
              onClick={() => setActiveTab('opportunities')}
            >
              {t.admin.dashboard.opportunities}
            </button>
          </li>
          {userType === 'root' && (
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'admins' ? 'active' : ''}`}
                onClick={() => setActiveTab('admins')}
              >
                {t.admin.dashboard.admins}
              </button>
            </li>
          )}
        </ul>
      </div>
      
      <div className="tab-content mt-4">
        {activeTab === 'experiences' && (
          <div className="experiences-tab">
            <h3>{t.admin.dashboard.experiences}</h3>
            
            {loading ? (
              <div className="text-center">
                <div className="spinner"></div>
                <p>{t.common.loading}</p>
              </div>
            ) : experiences.length === 0 ? (
              <div className="alert alert-info">{t.experiences.noExperiences}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t.experiences.university}</th>
                      <th>{t.experiences.major}</th>
                      <th>{t.experiences.company}</th>
                      <th>{t.experiences.recommended}</th>
                      <th>{t.common.status}</th>
                      <th>{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiences.map(experience => (
                      <tr key={experience.id}>
                        <td>{experience.id}</td>
                        <td>{experience.university_name}</td>
                        <td>{experience.major}</td>
                        <td>{experience.company_name}</td>
                        <td>{experience.recommended ? t.common.yes : t.common.no}</td>
                        <td>
                          <span className={`badge ${experience.status === 'visible' ? 'badge-success' : 'badge-secondary'}`}>
                            {experience.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-danger mr-2"
                            onClick={() => handleDeleteExperience(experience.id)}
                          >
                            {t.admin.dashboard.delete}
                          </button>
                          <button 
                            className={`btn btn-sm ${experience.status === 'visible' ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleExperienceStatus(experience.id, experience.status)}
                          >
                            {experience.status === 'visible' ? t.admin.dashboard.hide : t.admin.dashboard.show}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'opportunities' && (
          <div className="opportunities-tab">
            <h3>{t.admin.dashboard.opportunities}</h3>
            
            <div className="mb-3">
              <Link to="/admin/add-opportunity" className="btn btn-primary">
                {t.admin.dashboard.addOpportunity}
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center">
                <div className="spinner"></div>
                <p>{t.common.loading}</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="alert alert-info">{t.opportunities.noOpportunities}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t.opportunities.company}</th>
                      <th>{t.opportunities.major}</th>
                      <th>{t.opportunities.salary}</th>
                      <th>{t.opportunities.status}</th>
                      <th>{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opportunities.map(opportunity => (
                      <tr key={opportunity.id}>
                        <td>{opportunity.id}</td>
                        <td>{opportunity.company_name}</td>
                        <td>{opportunity.major_needed}</td>
                        <td>{opportunity.salary}</td>
                        <td>
                          <span className={`badge ${opportunity.status === 'open' ? 'badge-success' : 'badge-secondary'}`}>
                            {opportunity.status === 'open' ? t.opportunities.open : t.opportunities.closed}
                          </span>
                        </td>
                        <td>
                          <Link 
                            to={`/admin/edit-opportunity/${opportunity.id}`}
                            className="btn btn-sm btn-info mr-2"
                          >
                            {t.admin.dashboard.edit}
                          </Link>
                          <button 
                            className="btn btn-sm btn-danger mr-2"
                            onClick={() => handleDeleteOpportunity(opportunity.id)}
                          >
                            {t.admin.dashboard.delete}
                          </button>
                          <button 
                            className={`btn btn-sm ${opportunity.status === 'open' ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleOpportunityStatus(opportunity.id, opportunity.status)}
                          >
                            {opportunity.status === 'open' ? t.opportunities.closed : t.opportunities.open}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'admins' && userType === 'root' && (
          <div className="admins-tab">
            <h3>{t.admin.dashboard.admins}</h3>
            
            <div className="mb-3">
              <Link to="/admin/add-admin" className="btn btn-primary">
                {t.admin.dashboard.addAdmin}
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center">
                <div className="spinner"></div>
                <p>{t.common.loading}</p>
              </div>
            ) : admins.length === 0 ? (
              <div className="alert alert-info">No admins found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{t.admin.login.username}</th>
                      <th>{t.admin.addAdmin.type}</th>
                      <th>{t.common.createdAt}</th>
                      <th>{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin.id}>
                        <td>{admin.id}</td>
                        <td>{admin.username}</td>
                        <td>{admin.type}</td>
                        <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                        <td>
                          {admin.username !== username && (
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteAdmin(admin.username)}
                            >
                              {t.admin.dashboard.delete}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
