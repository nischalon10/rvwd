import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const nav = useNavigate()
  const { login, setUserId } = useAuth()

  // Animation control
  const [mounted, setMounted] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [hoveredGoogle, setHoveredGoogle] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const [showTagline, setShowTagline] = useState(false)

  useEffect(() => {
    // Respect user's reduced-motion preference
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReduceMotion(mql.matches)
      const onChange = (e) => setReduceMotion(e.matches)
      mql.addEventListener?.('change', onChange)
      mql.addListener?.(onChange)
      return () => {
        mql.removeEventListener?.('change', onChange)
        mql.removeListener?.(onChange)
      }
    }
  }, [])

  useEffect(() => {
    // Initial mount animation
    const id = requestAnimationFrame(() => setMounted(true))
    // Show tagline after initial animations
    const taglineTimer = setTimeout(() => setShowTagline(true), 800)
    return () => {
      cancelAnimationFrame(id)
      clearTimeout(taglineTimer)
    }
  }, [])

  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
  const BOUNCE = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  const transitionBase = reduceMotion ? 'none' : `transform 800ms ${EASE}, opacity 800ms ${EASE}, filter 800ms ${EASE}, box-shadow 400ms ${EASE}`

  const handleGoogleLogin = () => {
    setIsZooming(true)
    // Wait for zoom animation to complete before navigating
    setTimeout(() => {
      window.open('http://localhost:3000/auth/google', '_self')
    }, 1200)
  }
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: isZooming 
          ? 'radial-gradient(circle at center, #000 0%, #111 100%)'
          : 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%)',
        transition: isZooming ? 'background 1200ms ease-out' : 'background 2000ms ease-out',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated background particles */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 113, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 110, 199, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(0, 229, 255, 0.15) 0%, transparent 50%)
          `,
          animation: reduceMotion ? 'none' : 'pulse 4s ease-in-out infinite alternate',
          opacity: isZooming ? 0 : 1,
          transition: 'opacity 1200ms ease-out',
        }}
      />

      {/* Main Brand */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          transform: isZooming 
            ? 'scale(3) translateY(-20vh)' 
            : mounted || reduceMotion ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          opacity: mounted || reduceMotion ? 1 : 0,
          transition: isZooming 
            ? 'transform 1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1200ms ease-out'
            : transitionBase,
          zIndex: 2,
        }}
      >
        {/* RVWD Logo */}
        <div
          style={{
            fontSize: isZooming ? '8rem' : '6rem',
            fontWeight: 900,
            letterSpacing: isZooming ? '0.5rem' : '0.8rem',
            color: isZooming ? '#fff' : 'transparent',
            background: isZooming 
              ? 'transparent'
              : 'linear-gradient(135deg, #7871FF 0%, #FF6EC7 50%, #00E5FF 100%)',
            backgroundClip: isZooming ? 'initial' : 'text',
            WebkitBackgroundClip: isZooming ? 'initial' : 'text',
            WebkitTextFillColor: isZooming ? '#fff' : 'transparent',
            textAlign: 'center',
            marginBottom: isZooming ? '0' : '2rem',
            transform: mounted || reduceMotion ? 'translateY(0)' : 'translateY(-30px)',
            transition: isZooming 
              ? 'all 1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              : `${transitionBase}, background 2000ms ease-out`,
            transitionDelay: reduceMotion ? '0ms' : '100ms',
            textShadow: isZooming 
              ? '0 0 40px rgba(255, 255, 255, 0.8)'
              : '0 0 30px rgba(120, 113, 255, 0.3)',
          }}
        >
          RVWD
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '1.8rem',
            fontWeight: 600,
            color: '#94A3B8',
            textAlign: 'center',
            marginBottom: '3rem',
            opacity: isZooming ? 0 : showTagline ? 1 : 0,
            transform: showTagline ? 'translateY(0)' : 'translateY(20px)',
            transition: isZooming 
              ? 'opacity 600ms ease-out'
              : `opacity 1000ms ${EASE}, transform 1000ms ${EASE}`,
            transitionDelay: isZooming ? '0ms' : '200ms',
            maxWidth: '600px',
            lineHeight: 1.4,
          }}
        >
          Your AI-powered voice review assistant
        </div>

        {/* Login Card */}
        <div
          style={{
            background: isZooming 
              ? 'transparent'
              : 'rgba(255, 255, 255, 0.08)',
            backdropFilter: isZooming ? 'none' : 'blur(20px)',
            border: isZooming ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            minWidth: '400px',
            boxShadow: isZooming 
              ? 'none'
              : '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            transform: isZooming 
              ? 'scale(0.8) translateY(50px)'
              : mounted || reduceMotion ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
            opacity: isZooming ? 0 : mounted || reduceMotion ? 1 : 0,
            filter: isZooming ? 'blur(10px)' : mounted || reduceMotion ? 'blur(0px)' : 'blur(4px)',
            transition: isZooming 
              ? 'all 800ms ease-out'
              : transitionBase,
            transitionDelay: isZooming ? '0ms' : reduceMotion ? '0ms' : '300ms',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#F8FAFC',
                marginBottom: '0.5rem',
                letterSpacing: '1px',
              }}
            >
              Welcome
            </h1>
            <p
              style={{
                fontSize: '1.1rem',
                color: '#94A3B8',
                fontWeight: 400,
                margin: 0,
              }}
            >
              Continue with your Google account
            </p>
          </div>

          <button
            style={{
              width: '100%',
              padding: '1.2rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#1F2937',
              background: hoveredGoogle 
                ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transform: hoveredGoogle ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: hoveredGoogle 
                ? '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              transition: reduceMotion 
                ? 'none' 
                : 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              willChange: 'transform',
            }}
            onMouseEnter={() => setHoveredGoogle(true)}
            onMouseLeave={() => setHoveredGoogle(false)}
            onClick={handleGoogleLogin}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* Loading overlay during zoom */}
      {isZooming && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            opacity: 1,
            animation: reduceMotion ? 'none' : 'fadeIn 600ms ease-out 600ms both',
          }}
        >
          <div
            style={{
              color: '#fff',
              fontSize: '1.2rem',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                borderTop: '3px solid #fff',
                borderRadius: '50%',
                animation: reduceMotion ? 'none' : 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            Connecting to Google...
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          100% { opacity: 0.8; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}