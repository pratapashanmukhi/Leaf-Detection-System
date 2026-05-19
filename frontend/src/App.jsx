import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Camera from './Camera';
import Chatbot from './Chatbot';

// Security wrapper component preventing unauthenticated views
function PrivateRoute({ children, user }) {
  return user ? children : <Navigate to="/login" replace />;
}

// Standalone camera view route
function CameraPage({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <div className="nav-bar">
        <div className="nav-brand">
          <span className="upload-icon" style={{fontSize: '1.5rem', marginBottom: 0}}>🪴</span>
          <span>Leaf Detection</span>
        </div>
        <div className="nav-user">
          <span>Welcome, <strong>{user?.name}</strong></span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Camera Scanner</h1>
        <p>Position the leaf clearly in the center of the frame</p>
      </header>
      <main className="main-content" style={{ display: 'flex', justifyContent: 'center' }}>
         <div className="card upload-card" style={{ width: '100%', maxWidth: '600px' }}>
            <Camera 
                onCancel={() => navigate('/home')} 
                onCapture={(file) => {
                    navigate('/home', { state: { capturedImage: file }});
                }}
            />
         </div>
      </main>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Validate local storage token once at boot
    const savedUser = localStorage.getItem('leafalyze_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('leafalyze_user');
    setUser(null);
    navigate('/login');
  };

  // Block flickers while checking localStorage
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login onLogin={setUser} />} />
      <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <Signup />} />
      
      <Route path="/home" element={
        <PrivateRoute user={user}>
          <Home user={user} onLogout={handleLogout} />
        </PrivateRoute>
      } />
      
      <Route path="/camera" element={
        <PrivateRoute user={user}>
          <CameraPage user={user} onLogout={handleLogout} />
        </PrivateRoute>
      } />
      
      {/* Catch-all 404 safety redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Chatbot />
    </Router>
  );
}

export default App;
