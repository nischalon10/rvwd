import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { FormsProvider } from './context/FormsContext'
import { AuthProvider } from './context/AuthContext' // <-- Add this import

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FormsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FormsProvider>
    </AuthProvider>
  </React.StrictMode>
)