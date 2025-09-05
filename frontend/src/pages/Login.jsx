import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const nav = useNavigate()
  const [email,setEmail] = useState('')
  const [pw,setPw] = useState('')
  const { login, setUserId } = useAuth()

  // Modal state for account creation
  const [showModal, setShowModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Animation control
  const [mounted, setMounted] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [hoveredSignIn, setHoveredSignIn] = useState(false)
  const [hoveredSecondary, setHoveredSecondary] = useState(false)
  const [hoveredGhost, setHoveredGhost] = useState(false)

  useEffect(() => {
    // Respect user's reduced-motion preference
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReduceMotion(mql.matches)
      const onChange = (e) => setReduceMotion(e.matches)
      mql.addEventListener?.('change', onChange)
      // Fallback for older browsers
      mql.addListener?.(onChange)
      return () => {
        mql.removeEventListener?.('change', onChange)
        mql.removeListener?.(onChange)
      }
    }
  }, [])

  useEffect(() => {
    // Next frame so transitions apply after initial paint
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
  const transitionBase = reduceMotion ? 'none' : `transform 600ms ${EASE}, opacity 600ms ${EASE}, filter 600ms ${EASE}, box-shadow 300ms ${EASE}`

  function handleSubmit(e){
    e.preventDefault();
    // Use email as name if no name is provided
    const name = email.split('@')[0].replace(/\W/g, ' ');
    login({ name: name.charAt(0).toUpperCase() + name.slice(1), email });
    // Fetch userId from backend
    fetch('http://localhost:3000/users/find-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        console.log('find-id response', data);
        if (data && (data.userId || data.id)) {
          const id = data.userId || data.id;
          localStorage.setItem('userId', id);
          if (typeof setUserId === 'function') setUserId(id);
        }
        nav('/forms');
      })
      .catch(() => nav('/forms'));
  }
  // Handler for creating a new account
  function handleCreateAccount(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, name: newName }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create account")
        return res.json()
      })
      .then(() => {
        setMessage("Account created! You can now log in.")
        setShowModal(false)
        setNewEmail('')
        setNewName('')
      })
      .catch(() => setMessage("Error creating account."))
      .finally(() => setLoading(false))
  }
  return (
    <div
      style={{
        minHeight:'100vh',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 60%, #f1f5f9 100%)',
      }}
    >
      {/* Brand */}
      <div
        style={{
          position: 'fixed',
          top: 24,
          left: 32,
          color: '#111',
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 2,
          zIndex: 1000,
          transform: mounted || reduceMotion ? 'translateY(0)' : 'translateY(-8px)',
          opacity: mounted || reduceMotion ? 1 : 0,
          transition: transitionBase,
        }}
      >
        rvwd
      </div>

      <div
        className="container"
        style={{
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          minHeight:'80vh',
          transform: mounted || reduceMotion ? 'none' : 'translateY(6px)',
          opacity: mounted || reduceMotion ? 1 : 0,
          transition: transitionBase,
        }}
      >
        <div
          className="h1"
          style={{
            textAlign:'center',
            fontSize: '3rem',
            marginBottom: 32,
            transform: mounted || reduceMotion ? 'translateY(0)' : 'translateY(10px)',
            opacity: mounted || reduceMotion ? 1 : 0,
            transition: transitionBase,
            transitionDelay: reduceMotion ? '0ms' : '40ms',
          }}
        >
          Log in
        </div>

        <form
          onSubmit={handleSubmit}
          className="card"
          style={{
            maxWidth:520,
            width:'100%',
            margin:'0 auto',
            padding:'40px 36px',
            borderRadius: 16,
            background: '#ffffff',
            boxShadow: '0 8px 30px rgba(2, 6, 23, 0.06)',
            transform: mounted || reduceMotion ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
            opacity: mounted || reduceMotion ? 1 : 0,
            filter: mounted || reduceMotion ? 'blur(0px)' : 'blur(4px)',
            transition: transitionBase,
            transitionDelay: reduceMotion ? '0ms' : '60ms',
          }}
        >
          <div className="col" style={{ gap:18, transition: transitionBase, transform: mounted || reduceMotion ? 'none' : 'translateY(6px)', opacity: mounted || reduceMotion ? 1 : 0 }}>
            <label className="label" htmlFor="email" style={{fontSize:16}}>Email</label>
            <input
              id="email"
              type="email"
              className="input"
              style={{fontSize:18, padding:'18px 18px', transition: 'box-shadow 240ms ease, transform 240ms ease'}}
              placeholder="Enter your email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15)'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>

          <div className="col" style={{ marginTop:18, gap:18, transition: transitionBase, transform: mounted || reduceMotion ? 'none' : 'translateY(6px)', opacity: mounted || reduceMotion ? 1 : 0, transitionDelay: reduceMotion ? '0ms' : '80ms' }}>
            <label className="label" htmlFor="pw" style={{fontSize:16}}>Password</label>
            <input
              id="pw"
              type="password"
              className="input"
              style={{fontSize:18, padding:'18px 18px', transition: 'box-shadow 240ms ease, transform 240ms ease'}}
              placeholder="Enter your password"
              value={pw}
              onChange={e=>setPw(e.target.value)}
              required
              onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15)'}
              onBlur={e => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>

          <button
            className="btn block"
            style={{
              marginTop:24,
              fontSize:20,
              padding:'18px 0',
              transform: hoveredSignIn ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: hoveredSignIn ? '0 10px 24px rgba(2, 6, 23, 0.12)' : '0 6px 14px rgba(2, 6, 23, 0.08)',
              transition: reduceMotion ? 'none' : 'transform 200ms ease, box-shadow 200ms ease',
              willChange: 'transform',
            }}
            onMouseEnter={() => setHoveredSignIn(true)}
            onMouseLeave={() => setHoveredSignIn(false)}
          >
            Sign In
          </button>

          <div style={{marginTop:14}}>
            <a href="#" className="helper" style={{fontSize:15}}>Forgot password?</a>
          </div>
        </form>

        <div style={{height:48}}></div>

        <div
          style={{
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: 520,
            margin: '0 auto',
            transform: mounted || reduceMotion ? 'translateY(0)' : 'translateY(12px)',
            opacity: mounted || reduceMotion ? 1 : 0,
            transition: transitionBase,
            transitionDelay: reduceMotion ? '0ms' : '120ms',
          }}
        >
          <button
            className="btn secondary"
            style={{
              minWidth:220,
              fontSize:18,
              padding:'16px 0',
              transform: hoveredSecondary ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: hoveredSecondary ? '0 8px 20px rgba(2, 6, 23, 0.10)' : '0 4px 12px rgba(2, 6, 23, 0.06)',
              transition: reduceMotion ? 'none' : 'transform 200ms ease, box-shadow 200ms ease',
              willChange: 'transform',
            }}
            onMouseEnter={() => setHoveredSecondary(true)}
            onMouseLeave={() => setHoveredSecondary(false)}
            onClick={() => setShowModal(true)}
          >
            Create a new account
          </button>
          <button
            className="btn ghost"
            style={{
              minWidth:260,
              fontSize:18,
              padding:'16px 0',
              transform: hoveredGhost ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: hoveredGhost ? '0 8px 20px rgba(2, 6, 23, 0.08)' : 'none',
              transition: reduceMotion ? 'none' : 'transform 200ms ease, box-shadow 200ms ease',
              willChange: 'transform',
            }}
            onClick={() => {
                window.open('http://localhost:3000/auth/google', '_self');
            }}
            onMouseEnter={() => setHoveredGhost(true)}
            onMouseLeave={() => setHoveredGhost(false)}
          >
            Continue with Google
          </button>
        </div>
      </div>
      {/* Modal for creating a new account */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{
            borderRadius: 16,
            padding: '36px 32px 28px 32px',
            minWidth: 340,
            boxShadow: '0 8px 32px rgba(2,6,23,0.12)',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* X button in top right */}
            <button
              onClick={() => setShowModal(false)}
              disabled={loading}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                fontSize: 22,
                fontWeight: 700,
                color: '#888',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <h2 style={{
              marginBottom: 18,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 1,
              color: '#222'
            }}>
              Create a New Account
            </h2>
            <form onSubmit={handleCreateAccount} style={{ width: '100%' }}>
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
                style={{
                  marginBottom: 14,
                  width: "100%",
                  padding: '14px 14px',
                  borderRadius: 6,
                  border: '1.5px solid #e5e7eb',
                  fontSize: 17,
                  outline: 'none',
                  background: '#f9fafb',
                  fontWeight: 500,
                  color: '#222'
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
                style={{
                  marginBottom: 22,
                  width: "100%",
                  padding: '14px 14px',
                  borderRadius: 6,
                  border: '1.5px solid #e5e7eb',
                  fontSize: 17,
                  outline: 'none',
                  background: '#f9fafb',
                  fontWeight: 500,
                  color: '#222'
                }}
              />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn secondary"
                  disabled={loading}
                  style={{
                    background: '#111',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '12px 28px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
            {message && (
              <div style={{
                marginTop: 18,
                color: message.startsWith("Error") ? "#dc2626" : "#16a34a",
                fontWeight: 600,
                fontSize: 15
              }}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}