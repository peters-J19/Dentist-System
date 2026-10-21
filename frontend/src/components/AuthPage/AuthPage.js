// Login screen, mounted at "/". Before showing the form, it checks whether
// a Supabase session already exists (e.g. a returning user with a live
// session reopening the site) and skips straight past the login form if so.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage/LoginPage';
import { supabase } from '../../supabaseClient';
import './AuthPage.css';

function AuthPage() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/transition');
      } else {
        setCheckingSession(false);
      }
    });
  }, [navigate]);

  // Render nothing while the session check is in flight, rather than
  // flashing the login form for a returning user who's about to be
  // redirected straight past it.
  if (checkingSession) return <div />;

  return (
    <div 
      className="auth-page-container"
      style={{
        backgroundImage: "url(/assets/login-background.jpg)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="auth-card">
        <div className="form-container">
          <LoginPage />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;