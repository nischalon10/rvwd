import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { FormsProvider } from './context/FormsContext'
import { AuthProvider } from './context/AuthContext'
import { SearchProvider } from './context/SearchContext' // correct path, no .jsx/index.js

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FormsProvider>
        <SearchProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SearchProvider>
      </FormsProvider>
    </AuthProvider>
  </React.StrictMode>
)