import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar(){
  const { pathname } = useLocation()
  // Hide on login page
  const { user, logout } = useAuth()
  if (pathname === '/' || pathname === '/login') {
    return (
      <div className="nav">
        <div style={{display:'flex', alignItems:'center', height:56, minHeight:56, gap:16, width:'100%'}}>
          <div style={{color: '#111', fontWeight: 700, fontSize: 28, letterSpacing: 2, padding: '0 32px 0 24px'}}>
            <Link to="/forms" style={{color:'#111', textDecoration:'none'}}>rvwd</Link>
          </div>
          <div className="spacer" />
        </div>
      </div>
    )
  }

  // Dropdown state and outside click handler
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="nav">
      <div style={{display:'flex', alignItems:'center', height:56, minHeight:56, gap:16, width:'100%'}}>
        <div style={{color: '#111', fontWeight: 700, fontSize: 28, letterSpacing: 2, padding: '0 32px 0 24px'}}>
          <Link to="/forms" style={{color:'#111', textDecoration:'none'}}>rvwd</Link>
        </div>
        <div className="spacer" />
        {user && (
          <div style={{position:'relative', marginRight:24}} ref={dropdownRef}>
            <button className="btn secondary" style={{fontWeight:600, color:'#222', fontSize:16, display:'flex', alignItems:'center', gap:8, padding:'8px 16px'}} onClick={()=>setOpen(v=>!v)}>
              <span style={{borderRadius:'50%', background:'#bbb', width:28, height:28, display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:16}}>
                {user.name.split(' ').map(n=>n[0]).join('')}
              </span>
              {user.name}
              <span style={{fontSize:12, marginLeft:4}}>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div style={{position:'absolute', right:0, top:44, minWidth:220, background:'#fff', border:'1px solid #eee', borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,0.08)', zIndex:1000, padding:'16px 0'}}>
                <div style={{display:'flex', alignItems:'center', gap:12, padding:'0 20px 12px 20px', borderBottom:'1px solid #f0f0f0'}}>
                  <span style={{borderRadius:'50%', background:'#bbb', width:40, height:40, display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:20}}>
                    {user.name.split(' ').map(n=>n[0]).join('')}
                  </span>
                  <div>
                    <div style={{fontWeight:700, fontSize:16}}>{user.name}</div>
                    <div style={{fontSize:13, color:'#666'}}>{user.email}</div>
                  </div>
                </div>
                <div style={{padding:'12px 20px', cursor:'pointer', color:'#222', fontSize:15, fontWeight:500}}>
                  Settings
                </div>
                <div style={{padding:'12px 20px', cursor:'pointer', color:'#222', fontSize:15, fontWeight:500}}>
                  FAQ
                </div>
                <div style={{height:8}}></div>
                <div
                  style={{
                    padding:'12px 20px',
                    cursor:'pointer',
                    color:'#fff',
                    fontSize:15,
                    fontWeight:600,
                    background:'linear-gradient(90deg,#7c3aed 0%,#5b21b6 100%)',
                    borderRadius:6,
                    margin:'0 16px',
                    textAlign:'center',
                    boxShadow:'0 2px 8px rgba(124,58,237,0.08)',
                    transition:'background 0.2s',
                    border:'none',
                    outline:'none',
                    letterSpacing:1
                  }}
                  onClick={()=>{ logout(); window.location.href='/login'; }}
                  onMouseOver={e=>e.currentTarget.style.background='linear-gradient(90deg,#5b21b6 0%,#7c3aed 100%)'}
                  onMouseOut={e=>e.currentTarget.style.background='linear-gradient(90deg,#7c3aed 0%,#5b21b6 100%)'}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
