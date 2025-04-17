import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import LanguageContext from '../contexts/LanguageContext';
import translations from '../translations';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  
  const [redirecting, setRedirecting] = useState(false);

  if (!isAuthenticated) {
    if (!redirecting) {
      setRedirecting(true);
      setTimeout(() => {
        setRedirecting(false);
      }, 100);
    }
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
