import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FormDetail from './pages/FormDetail.jsx'
import CreateForm from './pages/CreateForm.jsx'
import Navbar from './components/Navbar.jsx'

export default function App(){
  return (
    <div>
      <Navbar />
      <Routes>
  <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forms" element={<Dashboard />} />
        <Route path="/forms/:id" element={<FormDetail />} />
        <Route path="/create" element={<CreateForm />} />
  <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
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
