import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CvProvider } from './context/CvContext';
import { BrowserRouter } from 'react-router-dom';

import { ErrorBoundary } from './ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CvProvider>
          <App />
        </CvProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
