import React, { useEffect, useRef, useState } from 'react';

function Camera({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    startCamera();
    
    // Stop the camera smoothly when the user closes this view
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Prompt user for camera permissions (favor back camera on mobile)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setError("Hardware access blocked. Please allow camera permissions in your browser settings.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Map canvas bounds to the exact intrinsic video resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Extract binary blob from the canvas element and trigger callback
      canvas.toBlob((blob) => {
        if (!blob) {
            setError("Failed to capture image due to an internal render error.");
            return;
        }
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        onCapture(file);
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <div className="upload-area" style={{ padding: '1rem', border: 'none', background: 'transparent' }}>
      {error ? (
        <div className="alert error" style={{ width: '100%', textAlign: 'center' }}>
          {error}
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="preview-img" 
            style={{ width: '100%', maxHeight: '350px', background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} 
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      <div className="action-buttons" style={{ width: '100%', marginTop: '1.5rem' }}>
        <button className="predict-btn secondary" onClick={() => { stopCamera(); onCancel(); }}>
          Cancel
        </button>
        {!error && (
          <button className="predict-btn" onClick={captureImage} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            📸 Capture Now
          </button>
        )}
      </div>
    </div>
  );
}

export default Camera;
