import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Catch successful signup messages forwarded via router state
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      // Clear the state so it doesn't show on manual refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`http://${window.location.hostname}:5000/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      localStorage.setItem('leafalyze_user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{marginBottom: "2rem", textAlign: "center"}}>
         <h1 style={{fontSize: "2.8rem", fontWeight: "800", lineHeight: "1.3", paddingBottom: "0.2em", background: "linear-gradient(to right, #34d399, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>Tomato Leaf Detection</h1>
         <p style={{color: "var(--text-muted)", marginTop: "0.5rem"}}>AI-Powered Crop Advisory System</p>
      </div>

      <div className="auth-container card" style={{marginTop: 0}}>
        <div className="auth-header">
          <div className="upload-icon">🪴</div>
          <h2>Welcome Back</h2>
          <p>Login to access the dashboard</p>
        </div>

        {successMsg && <div className="alert highlight" style={{marginBottom: '1rem', color: 'var(--primary)'}}>{successMsg}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="predict-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <span onClick={() => navigate('/signup')}>Sign up here</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
