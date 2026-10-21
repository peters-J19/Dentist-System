// The login form itself — email/password, inline validation, and the actual
// call to Supabase auth. Rendered by AuthPage; on success it hands off to
// the transition animation rather than navigating straight to the dashboard.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient'; // Make sure your Supabase client is set up correctly
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(null);

  // Supabase's auth errors come back in English; map the ones actually seen
  // in practice to Spanish for the UI, with a generic fallback otherwise.
  const translateError = (errorMessage) => {
    const translations = {
      "Invalid login credentials": "Correo electrónico o contraseña incorrecta",
      "Email not confirmed": "Correo electrónico no confirmado",
      "User already registered": "Este usuario ya esta registrado",
      "User not found": "Usuario no encontrado",
      "Email is not valid": "El correo electrónico no es válido",
      "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres",
      "Unexpected error": "Error inesperado. Inténtalo de nuevo.",
      "Unable to validate email address: invalid format": "No se pudo validar el correo electrónico: formato inválido",
      // Default fallback message
      "Invalid email or password": "Correo electrónico o contraseña inválidos",
    };
    return translations[errorMessage] || "Error desconocido. Inténtalo de nuevo.";
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (e) => {
    const val = e.target.value.trim();
    setEmail(e.target.value); // Don't trim display
    setIsEmailValid(emailRegex.test(val));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setIsPasswordValid(val.length >= 6);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
  
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });
  
    if (error) {
      const spanishMessage = translateError(error.message);
      setError(spanishMessage);
    } else {
      navigate('/transition');
    }
  
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="auth-form" noValidate>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Iniciar Sesión</h1>
      <div className={`input-container ${
        isEmailValid === true ? 'valid' :
        isEmailValid === false ? 'invalid' : ''
      }`}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={handleEmailChange}
          maxLength="100"
          required
        />
        {isEmailValid !== null && (
          <span className={`validation-icon ${isEmailValid ? 'valid' : 'invalid'}`}>
            {isEmailValid ? '✓' : 'Formato Correo Invalido - ✕'}
          </span>
        )}
      </div>
      <div className="input-container">
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={handlePasswordChange}
          maxLength="50"
          required
        />
        {isPasswordValid !== null && (
          <span className={`validation-icon ${isPasswordValid ? 'valid' : 'invalid'}`}>
            {isPasswordValid ? '✓' : 'Muy Corto - ✕'}
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !isEmailValid || !isPasswordValid}
      >
        {isLoading ? "Cargando..." : "Enviar"}
      </button>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
}

export default LoginPage;