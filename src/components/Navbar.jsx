import { Link, useLocation } from 'react-router-dom'
import { user } from '../mockData'

export default function Navbar(){
  const { pathname } = useLocation()
  return (
    <div className="nav">
      <div className="nav-inner">
        <div className="spacer" />
        {pathname.startsWith('/forms') && (
          <Link to="/create" className="btn small">Create a new form..</Link>
        )}
        <div className="badge">
          <div className="avatar" />
          <div>
            <div style={{fontWeight:700, lineHeight:'16px', fontSize:13}}>{user.name}</div>
            <div className="helper">{user.org}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
