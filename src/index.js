
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';

import { BrowserRouter } from 'react-router-dom'

// No provider for the page metadata: PageMeta writes to document.head itself.
// react-helmet and react-helmet-async were both tried and both silently wrote
// nothing in the production build under createRoot — see PageMeta.jsx.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>

);
