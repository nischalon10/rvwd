import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const nav = useNavigate()
  const [email,setEmail] = useState('')
  const [pw,setPw] = useState('')
  const { login } = useAuth()

  function handleSubmit(e){
    e.preventDefault()
    // Use email as name if no name is provided
    const name = email.split('@')[0].replace(/\W/g, ' ')
    login(email, name.charAt(0).toUpperCase() + name.slice(1))
    nav('/forms')
  }

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
      <div style={{position: 'fixed', top: 24, left: 32, color: '#111', fontWeight: 700, fontSize: 28, letterSpacing: 2, zIndex: 1000}}>rvwd</div>
      <div className="container" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh'}}>
        <div className="h1" style={{textAlign:'center', fontSize: '3rem', marginBottom: 32}}>Log in</div>

        <form onSubmit={handleSubmit} className="card" style={{maxWidth:520, width:'100%', margin:'0 auto', padding:'40px 36px'}}>
          <div className="col" style={{gap:18}}>
            <label className="label" htmlFor="email" style={{fontSize:16}}>Email</label>
            <input id="email" type="email" className="input" style={{fontSize:18, padding:'18px 18px'}} placeholder="Value" value={email} onChange={e=>setEmail(e.target.value)} required/>
          </div>

          <div className="col" style={{marginTop:18, gap:18}}>
            <label className="label" htmlFor="pw" style={{fontSize:16}}>Password</label>
            <input id="pw" type="password" className="input" style={{fontSize:18, padding:'18px 18px'}} placeholder="Value" value={pw} onChange={e=>setPw(e.target.value)} required/>
          </div>

          <button className="btn block" style={{marginTop:24, fontSize:20, padding:'18px 0'}}>Sign In</button>
          <div style={{marginTop:14}}>
            <a href="#" className="helper" style={{fontSize:15}}>Forgot password?</a>
          </div>
        </form>

        <div style={{height:48}}></div>

        <div style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: 520,
          margin: '0 auto'
        }}>
          <button className="btn secondary" style={{minWidth:220, fontSize:18, padding:'16px 0'}}>Create a new account</button>
          <button className="btn ghost" style={{minWidth:260, fontSize:18, padding:'16px 0'}}>Continue with Google</button>
        </div>
      </div>
    </div>
  )
}
