import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initErrorTracking } from './lib/analytics';
import './styles.css';

initErrorTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
