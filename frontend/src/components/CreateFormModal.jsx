import { useState } from 'react';
import { useForms } from '../context/FormsContext';

export default function CreateFormModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [snippet, setSnippet] = useState('');
  const [score, setScore] = useState('');
  const { forms, setForms } = useForms();

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !snippet || !score) return;
    setForms([
      ...forms,
      {
        id: Date.now().toString(),
        title,
        snippet,
        score: parseFloat(score)
      }
    ]);
    onClose();
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(100,100,100,0.7)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="card" style={{maxWidth:520, width:'100%', position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute',top:12,right:16,fontSize:24,background:'none',border:'none',color:'#888',cursor:'pointer'}}>&times;</button>
  <div className="h1">Create New Form</div>
        <form onSubmit={handleSubmit}>
          <div className="col">
            <label className="label">Name</label>
            <input className="input" placeholder="Value" value={title} onChange={e=>setTitle(e.target.value)} />

            <label className="label">Description</label>
            <input className="input" placeholder="Value" value={snippet} onChange={e=>setSnippet(e.target.value)} />

            <label className="label">Score (0-10)</label>
            <input className="input" type="number" min="0" max="10" step="0.1" placeholder="Value" value={score} onChange={e=>setScore(e.target.value)} />

            <button className="btn" type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
