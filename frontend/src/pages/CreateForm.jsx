import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForms } from '../context/FormsContext';

export default function CreateForm(){
  const [title, setTitle] = useState('');
  const [snippet, setSnippet] = useState('');
  const [score, setScore] = useState('');
  const { forms, setForms } = useForms();
  const nav = useNavigate();

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
  nav('/forms');
  }

  return (
    <div className="container">
  <div className="h1">Create New Form</div>
      <form className="card" style={{maxWidth:520}} onSubmit={handleSubmit}>
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
  )
}
