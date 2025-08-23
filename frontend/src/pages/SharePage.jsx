import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function SharePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Placeholder for audio and text, replace with real data as needed
  const question = 'What is your thoughts on the class so far?';
  const audioUrl = '';
  const transcript = 'So basically the restaurant had a good ambience but there was a bug on the table when we sat which was pretty annoying that we had to clean it ourself..';

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
      <h1 style={{ fontWeight: 400, fontSize: 32, marginTop: 60, marginBottom: 48, textAlign: 'center' }}>{question}</h1>
      <div style={{ width: 240, height: 240, borderRadius: '50%', background: '#d9d9d9', margin: '0 auto 32px auto' }} />
      <audio controls style={{ width: 420, background: '#d9d9d9', borderRadius: 0, margin: '0 0 32px 0' }}>
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <div style={{ width: 600, margin: '0 auto 32px auto', color: '#666', fontSize: 13, textAlign: 'left' }}>
        {transcript}
        <div style={{ borderBottom: '1px solid #ccc', marginTop: 8 }} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <button onClick={() => navigate(-1)} style={{ width: 140, height: 28, borderRadius: 6, border: '1px solid #bbb', background: '#f6f6f6', color: '#222', fontSize: 15, cursor: 'pointer' }}>Cancel</button>
        <button style={{ width: 140, height: 28, borderRadius: 6, border: 'none', background: '#222', color: '#fff', fontSize: 15, cursor: 'pointer' }}>Submit</button>
      </div>
    </div>
  );
}
