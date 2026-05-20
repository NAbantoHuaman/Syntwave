import React, { useState, useEffect } from 'react';

export default function ViewLogin({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Validation and Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: '', percentage: 0 });
  
  // Realistic Loading simulation
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    'Verificando credenciales...',
    'Cargando tu biblioteca local...',
    'Sincronizando tus me gusta...',
    'Preparando tu reproductor...'
  ];

  // Dynamic Password Strength Meter
  useEffect(() => {
    if (mode !== 'register' || !password) {
      setPasswordStrength({ label: '', color: '', percentage: 0 });
      return;
    }

    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    let label = 'Débil';
    let color = '#e8115b'; // Red
    if (strength === 50) {
      label = 'Media';
      color = '#bc5900'; // Orange
    } else if (strength >= 75) {
      label = 'Fuerte';
      color = '#ff007f'; // Synthwave Pink
    }

    setPasswordStrength({ label, color, percentage: strength });
  }, [password, mode]);

  // Handle shake animation trigger on error
  const triggerError = (msg) => {
    setErrorMsg(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      triggerError('Por favor completa todos los campos.');
      return;
    }

    // Retrieve registered users from local storage
    const savedUsers = localStorage.getItem('registeredUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    // Check if credentials match any user
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      triggerError('El correo ingresado no está registrado.');
      return;
    }

    if (foundUser.password !== password) {
      triggerError('La contraseña es incorrecta.');
      return;
    }

    // Credentials verified! Trigger simulated load sequence
    runLoginSequence(foundUser);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !username) {
      triggerError('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      triggerError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const savedUsers = localStorage.getItem('registeredUsers');
    const users = savedUsers ? JSON.parse(savedUsers) : [];

    // Check duplicate email
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      triggerError('Este correo electrónico ya está registrado.');
      return;
    }

    // Save new user profile credentials
    const newUser = {
      username: username.trim(),
      email: email.trim(),
      password: password,
      avatarColor: '#ff007f',
      preferredGenre: '',
      creationDate: 'Mayo 2026'
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    // Registration successful! Trigger loading sequence with the new user profile
    runLoginSequence(newUser);
  };

  const handleDemoAccess = () => {
    // Demo Account credentials
    const demoUser = {
      username: 'Synthwave Explorer',
      email: 'demo@synthwave.com',
      avatarColor: '#8e2de2',
      preferredGenre: 'Lofi Chill',
      creationDate: 'Mayo 2026'
    };
    runLoginSequence(demoUser);
  };

  const runLoginSequence = (userObj) => {
    setErrorMsg('');
    setIsLoading(true);
    setLoadingStep(0);

    // Simulate multi-step progress bar loader
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onLogin(userObj);
          }, 300);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
  };

  return (
    <div className="login-screen-wrapper">
      {/* Animated abstract visual gradients background */}
      <div className="login-bg-glow glow-1"></div>
      <div className="login-bg-glow glow-2"></div>

      <div className={`login-glass-card ${shakeError ? 'shake' : ''}`}>
        {/* Sleek Synthwave Premium visualizer logo */}
        <div className="login-brand">
          <svg viewBox="0 0 24 24" className="brand-logo-svg" style={{ width: '32px', height: '32px' }}>
            <defs>
              <linearGradient id="synthwaveGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff007f" />
                <stop offset="50%" stopColor="#7928ca" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
            </defs>
            <path d="M12 2a10 10 0 0 1 10 10c0 1.25-.23 2.45-.65 3.56h-2.12c.45-.98.77-2.03.77-3.56a8 8 0 0 0-16 0c0 1.53.32 2.58.77 3.56H2.65A9.94 9.94 0 0 1 2 12 10 10 0 0 1 12 2z" fill="url(#synthwaveGradLogin)" />
            <path d="M4 17.5h16c-.47.88-1.07 1.66-1.78 2.29H5.78C5.07 19.16 4.47 18.38 4 17.5z" fill="url(#synthwaveGradLogin)" opacity="0.8" />
            <path d="M7.7 21h8.6c-.34.36-.72.67-1.15.93H8.85c-.43-.26-.81-.57-1.15-.93z" fill="url(#synthwaveGradLogin)" opacity="0.6" />
            <path d="M12 7v10M9 9v6M15 9v6M6 11v2M18 11v2" stroke="url(#synthwaveGradLogin)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="brand-text">Synthwave</span>
        </div>

        {isLoading ? (
          /* High fidelity transition loader display */
          <div className="login-loading-container">
            <div className="custom-spinner-ring">
              <div className="inner-dot"></div>
            </div>
            <div className="loading-step-text">
              {loadingMessages[loadingStep]}
            </div>
            <div className="loading-progress-bar-wrapper">
              <div 
                className="loading-progress-bar-fill" 
                style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          /* Normal Authentication Card forms */
          <>
            <h2 className="login-welcome-title">
              {mode === 'login' ? 'Música retro-futurista a un clic' : 'Únete al sonido Synthwave'}
            </h2>
            <p className="login-welcome-subtitle">
              {mode === 'login' ? 'Inicia sesión para acceder a tu biblioteca y reproductor global.' : 'Crea una cuenta local persistida de forma 100% segura.'}
            </p>

            {errorMsg && (
              <div className="login-error-alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="login-form-fields">
              {mode === 'register' && (
                <div className="login-field-group">
                  <label htmlFor="regUsername">¿Cómo te llamas?</label>
                  <input
                    id="regUsername"
                    type="text"
                    placeholder="Tu alias o nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              )}

              <div className="login-field-group">
                <label htmlFor="authEmail">Correo electrónico</label>
                <input
                  id="authEmail"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="login-field-group">
                <label htmlFor="authPassword">Contraseña</label>
                <input
                  id="authPassword"
                  type="password"
                  placeholder={mode === 'login' ? 'Ingresa tu contraseña' : 'Crea tu clave segura'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />

                {mode === 'register' && password && (
                  <div className="password-strength-meter">
                    <div className="strength-label">
                      Seguridad: <span style={{ color: passwordStrength.color, fontWeight: '700' }}>{passwordStrength.label}</span>
                    </div>
                    <div className="strength-bar-bg">
                      <div 
                        className="strength-bar-fill" 
                        style={{ 
                          width: `${passwordStrength.percentage}%`, 
                          backgroundColor: passwordStrength.color 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="login-action-main-btn">
                {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            </form>

            <div className="login-divider">
              <span>o continúa con</span>
            </div>

            {/* Quick Demo and Social Grid */}
            <div className="social-login-grid">
              <button className="social-login-btn demo" onClick={handleDemoAccess} title="Acceder con cuenta Demo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', width: '18px', height: '18px' }}>
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                Invitado / Acceso Rápido
              </button>

              <div className="social-subgrid">
                <button className="social-login-btn inline" title="Iniciar sesión con Google" onClick={handleDemoAccess}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.3-.178-1.857H12.24z"/>
                  </svg>
                </button>
                <button className="social-login-btn inline" title="Iniciar sesión con Apple" onClick={handleDemoAccess}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.15-.52 2.81-1.33z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="login-footer-switch">
              <span>{mode === 'login' ? '¿No tienes cuenta?' : '¿Ya eres miembro?'}</span>
              <button onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg('');
                setEmail('');
                setPassword('');
                setUsername('');
              }}>
                {mode === 'login' ? 'Regístrate aquí' : 'Inicia Sesión'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
