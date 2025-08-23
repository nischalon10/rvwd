import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { FormsProvider } from './context/FormsContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FormsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FormsProvider>
  </React.StrictMode>
)
