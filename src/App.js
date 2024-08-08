import './App.css';
import './styles/customScrollbar.css';
import React, { useState, useEffect, createContext } from 'react';
import { ThemeContextProvider } from './components/ThemeContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { AlertProvider } from './components/AlertContext';
import Content from './Content';
import { WebSocketProvider } from './components/WebSocketContext';

// Create a context
export const BackendContext = createContext();

function App() {
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('backendUrl') || '';
  });

  const [backendStatus, setBackendStatus] = useState(false);


  useEffect(() => {
    localStorage.setItem('backendUrl', backendUrl);
  }, [backendUrl]);

  return (
    <ThemeContextProvider>
      <BackendContext.Provider value={{ backendUrl, setBackendUrl, backendStatus, setBackendStatus }}>
        <AlertProvider>
          <WebSocketProvider>
            <Router>
              <div class="parent-container">
                <div className="custom-scrollbar" style={{ overflow: 'hidden' }}>
                  <Content />
                </div>
              </div>
            </Router>
          </WebSocketProvider>
        </AlertProvider>
      </BackendContext.Provider>
    </ThemeContextProvider>
  );
}

export default App;