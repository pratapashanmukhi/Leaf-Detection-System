import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import Camera from './Camera';

function Home({ user, onLogout }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const reportRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Dynamically grab photo blobs returned backwards from the distinct Camera Route
    if (location.state?.capturedImage) {
      const file = location.state.capturedImage;
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      
      // Clean history API buffer preventing reload glitches triggering previous data reads
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const [showCamera, setShowCamera] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Splash screen timer
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Automatically open the camera after splash as requested
        setShowCamera(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const triggerCamera = () => {
    setShowCamera(true);
  };

  const handleCameraCapture = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setShowCamera(false);
  };

  const handlePredict = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await fetch(`http://${window.location.hostname}:5000/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to predict disease.');
      }

      setResult(data);
      // Append to history conditionally
      if (data.disease !== "Not a Leaf") {
        setHistory((prev) => [{...data, id: Date.now()}, ...prev]);
      }
    } catch (err) {
      setError(err.message || 'Unable to reach the server. Is the Flask API running?');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    if (!result) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = `The specimen is identified as ${result.crop}. Condition: ${result.disease}. Severity: ${result.severity_level || 'Unknown'}. Pathology: ${result.description}. Treatment protocol: ${result.treatment}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#111827' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.setFontSize(16);
      pdf.setTextColor(16, 185, 129); // Primary green
      pdf.text("Leaf Detection AI - Official Diagnostic Report", 14, 15);
      
      pdf.addImage(imgData, 'PNG', 10, 25, pdfWidth - 20, pdfHeight - 20);
      pdf.save(`Diagnostic_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF Failed", err);
      alert("Failed to generate PDF report.");
    }
  };

  if (showSplash) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#030712', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        animation: 'fadeInOut 2.5s ease-in-out'
      }}>
        <div style={{
          fontSize: '6rem', marginBottom: '1rem', 
          animation: 'float 3s ease-in-out infinite'
        }}>
          🪴
        </div>
        <h1 style={{
          color: '#10b981', fontSize: '2.5rem', fontWeight: 800,
          letterSpacing: '-1px'
        }}>
          Leaf Detection
        </h1>
        <p style={{ color: '#9ca3af', marginTop: '1rem', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
          Initializing AI Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Top Navigation Panel */}
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

      <header className="header">
        <h1>Tomato Leaf Detection System</h1>
        <p>AI-Powered Crop Advisory Dashboard</p>
      </header>

      <main className="main-content">
        <div className="card upload-card">
          <h2 className="card-title">
            Specimen Analysis
          </h2>
          
          <div className="upload-area" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if(e.dataTransfer.files && e.dataTransfer.files[0]) { setImage(e.dataTransfer.files[0]); setPreview(URL.createObjectURL(e.dataTransfer.files[0])); setResult(null); setError(null); }}}>
            {showCamera ? (
              <Camera 
                onCancel={() => setShowCamera(false)} 
                onCapture={handleCameraCapture} 
              />
            ) : preview ? (
              <div className="preview-container">
                <img src={preview} alt="Plant Leaf Preview" className="preview-img" />
                <button className="reset-btn" onClick={(e) => { e.stopPropagation(); resetScanner(); }}>✕ Remove</button>
              </div>
            ) : (
              <div className="placeholder">
                <div className="upload-icon-circle">
                  <svg width="32" height="32" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <h3>Drag & Drop Specimen</h3>
                <p>or</p>
                <button className="browse-btn" onClick={() => fileInputRef.current.click()}>
                  Browse Files
                </button>
                <p className="file-hint">Supports JPG, PNG (Max 10MB)</p>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }} 
            />
          </div>

          <div className="action-buttons">
             <button 
                className="predict-btn secondary" 
                onClick={triggerCamera} 
              >
                📸 Use Camera
              </button>

              <button 
                className="predict-btn" 
                onClick={handlePredict} 
                disabled={!image || loading}
              >
                {loading ? <span className="loader">Analyzing</span> : "Run Diagnostics"}
              </button>
          </div>

          {error && (
            <div className="alert error" style={{marginTop: '1.5rem'}}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}
        </div>

        <div className="sidebar-group">
          {result ? (
            <div className="card result-card fade-in">
              <div ref={reportRef} style={{ padding: '0.5rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)' }}>
                <h2>Diagnostic Report</h2>
                <div className="result-grid">
                  <div className="result-item highlight">
                    <span className="label">Specimen</span>
                    <span className="value">{result.crop}</span>
                  </div>
                  <div className="result-item highlight">
                    <span className="label">Condition</span>
                    <span className="value">{result.disease}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">Confidence</span>
                    <span className={`value ${result.confidence > 80 ? 'confidence-high' : ''}`}>
                      {result.confidence}%
                    </span>
                  </div>
                  {result.severity !== undefined && (
                    <div className="result-item">
                      <span className="label">Severity Level</span>
                      <span className="value" style={{color: result.severity > 50 ? '#ef4444' : '#eab308'}}>
                        {result.severity}%
                      </span>
                      <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{result.severity_level}</span>
                    </div>
                  )}
                </div>

                <div className="info-box description">
                  <h3>Pathology</h3>
                  <p>{result.description}</p>
                </div>

                <div className="info-box treatment">
                  <h3>Treatment Protocol</h3>
                  <p>{result.treatment}</p>
                </div>
              </div>

              {/* Action Buttons entirely omitted from PDF canvas snapshot */}
              <div className="action-buttons" style={{marginTop: '1.5rem', display: 'flex', gap: '1rem'}}>
                <button className="predict-btn secondary" onClick={handleSpeak} style={{flex: 1, padding: '0.8rem'}}>
                  {isSpeaking ? '⏹ Stop Audio' : '🔊 Read Aloud'}
                </button>
                <button className="predict-btn" onClick={handleDownloadPDF} style={{flex: 1, padding: '0.8rem'}}>
                  📄 Download PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="card history-card" style={{minHeight: "300px"}}>
              <h2>Past Predictions</h2>
              {history.length > 0 ? (
                <ul className="history-list">
                  {history.map((item) => (
                    <li key={item.id} className="history-item">
                      <span className="history-disease">{item.disease}</span>
                      <span className="history-conf">{item.confidence}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <p>No recent diagnostic history available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
