import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

if (!window.location.hash) {
  window.location.hash = '/accu';
}

// No StrictMode: it runs effects twice in dev, which would double every event in the event log.
createRoot(document.getElementById('root')!).render(<App />);
