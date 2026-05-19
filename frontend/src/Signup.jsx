import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://${window.location.hostname}:5000/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed.');
      }

      // Securely pass a prompt banner to the login route
      navigate('/login', { state: { message: "Account created successfully! Please login." } });
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
          <h2>Create an Account</h2>
          <p>Join the Intelligence Network</p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a strong password"
            />
          </div>

          <button type="submit" className="predict-btn" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <span onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
