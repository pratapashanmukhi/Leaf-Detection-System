import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I am Agri-Bot 🤖. How can I assist you with your crop diagnostics today?" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const generateBotResponse = (userMessage) => {
    const text = userMessage.toLowerCase();
    
    // Smart Keyword Rules Engine
    if (text.includes("how") && (text.includes("use") || text.includes("work"))) {
      return "It's simple! 1. Drag & Drop a leaf photo or use the 📸 camera. 2. Click 'Run Diagnostics'. 3. Review the pathology, severity score, and treatment protocol!";
    }
    if (text.includes("unique") || text.includes("difference") || text.includes("special")) {
      return "This system uses advanced Biological Heuristics (Chlorophyll & Edge Density scans) to block fake objects, unlike basic CNNs! It also features Severity Scoring, PDF Reports, and Voice Output.";
    }
    if (text.includes("cure") || text.includes("remedy") || text.includes("remedies") || text.includes("treatment") || text.includes("treat")) {
      return "Home remedies include using Neem Oil spray or baking soda water for fungal issues. However, if the severity is 'Critical', we highly recommend using chemical fungicides like chlorothalonil for immediate plant rescue.";
    }
    if (text.includes("prevent") || text.includes("stop")) {
      return "To prevent tomato diseases: ensure good air circulation, avoid watering the leaves (water the base), and remove affected leaves immediately to stop the spread!";
    }
    if (text.includes("disease") || text.includes("detect") || text.includes("what")) {
      return "I can detect major tomato diseases including Late Blight, Early Blight, Leaf Mold, Spider Mites, Bacterial Spot, Mosaic Virus, and more!";
    }
    if (text.includes("accuracy") || text.includes("confident") || text.includes("model")) {
      return "Our underlying AI model is a Deep Convolutional Neural Network trained on thousands of augmented plant images, offering extremely high validation accuracy.";
    }
    if (text.includes("blight")) {
      return "Blight is a highly destructive fungal disease. It causes dark, water-soaked spots. Our system detects both Early and Late Blight and recommends immediate fungicide treatments.";
    }
    if (text.includes("hi") || text.includes("hello") || text.includes("hey")) {
      return "Hi there! Feel free to ask me how the system works, what makes it unique, or ask for home remedies!";
    }
    if (text.includes("who made") || text.includes("who built") || text.includes("creator")) {
      return "This system was developed as a highly advanced academic engineering project by Pratapa!";
    }
    
    // Default Fallback
    return "I'm a simple Agri-Bot! Try asking me things like: 'What makes this project unique?', 'How to cure diseases?', or 'How does the accuracy work?'";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    
    // Simulate thinking delay
    setTimeout(() => {
      const botReply = generateBotResponse(userMsg);
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <div className={`chatbot-wrapper ${isOpen ? 'open' : ''}`}>
      {/* The Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span className="bot-title">Agri-Bot Assistant 🤖</span>
            <button className="close-bot-btn" onClick={toggleChat}>✕</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask me something..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim()}>❯</button>
          </form>
        </div>
      )}

      {/* The Floating Toggle Button */}
      <button className="chatbot-toggle-btn" onClick={toggleChat}>
        {isOpen ? '💬 Close Chat' : '🤖 Agri-Bot Help'}
      </button>
    </div>
  );
};

export default Chatbot;
