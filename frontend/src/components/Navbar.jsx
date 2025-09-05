import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearch } from '../context/SearchContext'

export default function Navbar(){
  const { pathname } = useLocation()
  const isDashboard = pathname === '/forms'
  const { user, logout } = useAuth()
  const { query, setQuery } = useSearch();

  if (pathname === '/' || pathname === '/login') {
    return null
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
      <div style={{
        display:'flex',
        alignItems:'center',
        height:56,
        minHeight:56,
        gap:16,
        width:'100%'
      }}>
        <div style={{
          color: '#111',
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 2,
          padding: '0 32px 0 24px'
        }}>
          <Link to="/forms" style={{color:'#111', textDecoration:'none'}}>rvwd</Link>
        </div>
        {/* Centered search bar only on dashboard */}
        {isDashboard && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 820 }}>
              <span
                style={{
                  position: 'absolute',
                  left: 18,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#aaa',
                  fontSize: 22,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {/* Search icon SVG */}
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 28px 10px 48px', // left padding for icon
                  borderRadius: 8,
                  border: '1px solid #eee',
                  background: '#f7f7fa',
                  fontSize: 17,
                  marginRight: 0,
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              />
              {/* Clear (X) button */}
              {query && query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    padding: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        {/* Spacer to push account to right if search bar is not shown */}
        {!isDashboard && <div style={{ flex: 1 }} />}
        {/* Account dropdown always on the right */}
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


