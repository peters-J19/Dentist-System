// Route guard for everything under SideBar. Checks for a live Supabase
// session before rendering the protected route tree, and keeps listening
// for auth changes afterwards so a logout mid-session redirects immediately
// instead of waiting for the next page load.
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

function RequireAuth() {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Blank placeholder for the brief moment the session check is in flight —
  // getSession() reads local storage so this resolves almost instantly.
  if (loading) return <div />;

  return hasSession ? <Outlet /> : <Navigate to="/" replace />;
}

export default RequireAuth;
