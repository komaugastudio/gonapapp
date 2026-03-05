import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <-- BARIS INI SANGAT PENTING

// Suppress known harmless warnings from console
const filterMessage = (str) => {
  const msg = String(str || '');
  // Suppress Firebase Firestore permission-denied errors
  if (msg.includes('@firebase/firestore') || 
      msg.includes('permission-denied') ||
      msg.includes('Cross-Origin-Opener-Policy') ||
      msg.includes('Download the React DevTools')) {
    return true;
  }
  return false;
};

const originalError = console.error;
console.error = function(...args) {
  if (filterMessage(args[0])) return;
  originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = function(...args) {
  if (filterMessage(args[0])) return;
  originalWarn.apply(console, args);
};

const originalLog = console.log;
console.log = function(...args) {
  if (filterMessage(args[0])) return;
  originalLog.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)