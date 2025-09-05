import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FormDetail from './pages/FormDetail.jsx'
import CreateForm from './pages/CreateForm.jsx'
import Navbar from './components/Navbar.jsx'
import SharePage from './pages/SharePage.jsx'
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

export default function App() {
  const location = useLocation();
  const { login, setUserId } = useAuth() || {};

  // Only set user if redirected from Google OAuth (with name & email in URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const email = params.get('email');
    if (name && email) {
      login({ name, email });
      // Fetch userId from backend
      fetch('http://localhost:3000/users/find-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.userId) {
            localStorage.setItem('userId', data.userId);
            if (typeof setUserId === 'function') setUserId(data.userId);
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(() => window.history.replaceState({}, document.title, window.location.pathname));
    }
  }, [login, setUserId]);

  return (
    <div>
      {/* Removed the far right user info/logout button */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forms" element={<Dashboard />} />
        <Route path="/forms/:id" element={<FormDetail />} />
        <Route path="/create" element={<CreateForm />} />
        <Route path="/share/:id" element={<SharePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container">
      <div className="h1">404</div>
      <p>Page not found.</p>
      <Link to="/forms" className="btn">Go to dashboard</Link>
    </div>
  );
}