import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FormDetail from './pages/FormDetail.jsx'
import CreateForm from './pages/CreateForm.jsx'
import Navbar from './components/Navbar.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import SharePage from './pages/SharePage.jsx';
import { useLocation } from 'react-router-dom'

export default function App(){
  const location = useLocation()
  const isLogin = location.pathname === '/' || location.pathname === '/login'
  return (
    <AuthProvider>
      <div>
        {!isLogin && (
          <div style={{position: 'fixed', top: 24, left: 32, color: '#111', fontWeight: 700, fontSize: 28, letterSpacing: 2, zIndex: 1000, pointerEvents:'none'}}>
            rvwd
          </div>
        )}
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
    </AuthProvider>
  )
}

function NotFound(){
  return (
    <div className="container">
      <div className="h1">404</div>
      <p>Page not found.</p>
      <Link to="/forms" className="btn">Go to dashboard</Link>
    </div>
  )
}
