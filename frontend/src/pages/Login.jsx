import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const nav = useNavigate()
  const [email,setEmail] = useState('')
  const [pw,setPw] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    nav('/forms')
  }

  return (
    <div>
      <div style={{position: 'fixed', top: 24, left: 32, color: '#111', fontWeight: 700, fontSize: 28, letterSpacing: 2, zIndex: 1000}}>rvwd</div>
      <div className="container">
        <div className="h1">Log in</div>

      <form onSubmit={handleSubmit} className="card" style={{maxWidth:720}}>
        <div className="col">
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" placeholder="Value" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </div>

        <div className="col" style={{marginTop:10}}>
          <label className="label" htmlFor="pw">Password</label>
          <input id="pw" type="password" className="input" placeholder="Value" value={pw} onChange={e=>setPw(e.target.value)} required/>
        </div>

        <button className="btn block" style={{marginTop:14}}>Sign In</button>
        <div style={{marginTop:10}}>
          <a href="#" className="helper">Forgot password?</a>
        </div>
      </form>

      <div style={{height:120}}></div>

      <div style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        maxWidth: 720,
        margin: '0 auto'
      }}>
        <button className="btn secondary" style={{minWidth:200}}>Create a new account</button>
        <button className="btn ghost" style={{minWidth:240}}>Continue with Google</button>
      </div>
      </div>
    </div>
  )
}
