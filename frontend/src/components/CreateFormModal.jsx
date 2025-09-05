import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CreateFormModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Default extractionSchema and uiHints as per README.md
  const extractionSchema = {
    usabilityScore: { type: "number", min: 1, max: 10 },
    sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
    features: { type: "array", items: { type: "string" } },
    suggestions: { type: "string" }
  };
  const uiHints = ["Rate usability 1-10", "Mention specific features"];
  const { user } = useAuth();
  const ownerId = (user && user.userId) || localStorage.getItem('userId');

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!ownerId) {
    setMessage('User ID missing. Please log in again.');
    setLoading(false);
    return;
    }
    const body = {
      title,
      description,
      question,
      extractionSchema,
      uiHints,
      ownerId
    };

    fetch("http://localhost:3000/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create form");
        return res.json();
      })
      .then(() => {
        setMessage("Form created!");
        onClose();
      })
      .catch(() => setMessage("Error creating form."))
      .finally(() => setLoading(false));
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
      <div className="card" style={{maxWidth:520, width:'100%', position:'relative', paddingBottom:32}}>
        <button onClick={onClose} style={{position:'absolute',top:12,right:16,fontSize:24,background:'none',border:'none',color:'#888',cursor:'pointer'}}>&times;</button>
        <div className="h1">Create New Form</div>
        <form onSubmit={handleSubmit}>
          <div className="col">
            <label className="label">Title</label>
            <input className="input" placeholder="Survey Title" value={title} onChange={e=>setTitle(e.target.value)} required />

            <label className="label">Description</label>
            <input className="input" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} required />

            <label className="label">Question</label>
            <input className="input" placeholder="Open-ended Question" value={question} onChange={e=>setQuestion(e.target.value)} required />

            <button className="btn" type="submit" style={{marginTop:32, marginBottom:16}} disabled={loading}>
              {loading ? "Creating..." : "Submit"}
            </button>
            {message && (
              <div style={{ marginTop: 12, color: message.startsWith("Error") ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                {message}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}