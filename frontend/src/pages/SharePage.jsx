import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function SharePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const question = location.state?.question || 'No question provided.';
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [recording, setRecording] = useState(false);

  if (!browserSupportsSpeechRecognition) {
    return <div style={{textAlign:'center', marginTop:40}}>Your browser does not support speech recognition.</div>;
  }

  const handleCircleClick = () => {
    if (!recording) {
      setRecording(true);
      SpeechRecognition.startListening({ continuous: true });
    } else {
      setRecording(false);
      SpeechRecognition.stopListening();
    }
  };

  const handleRetry = () => {
    setRecording(false);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
      <h1 style={{ fontWeight: 400, fontSize: 32, marginTop: 60, marginBottom: 48, textAlign: 'center' }}>{question}</h1>
      <div
        onClick={handleCircleClick}
        style={{ width: 240, height: 240, borderRadius: '50%', background: '#d9d9d9', margin: '0 auto 32px auto', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow: recording ? '0 0 0 8px #e0e0e0' : 'none', transition:'box-shadow 0.2s' }}
      >
        {/* Play/Stop icon */}
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {recording ? (
            <circle cx="32" cy="32" r="20" fill="#aaa" />
          ) : (
            <polygon points="24,18 48,32 24,46" fill="#222" />
          )}
        </svg>
      </div>
      {/* Transcript display */}
      <div style={{ width: 600, margin: '0 auto 32px auto', color: '#666', fontSize: 15, textAlign: 'left', minHeight: 40 }}>
        {transcript ? transcript : <span style={{color:'#bbb'}}>Transcript will appear here...</span>}
        <div style={{ borderBottom: '1px solid #ccc', marginTop: 8 }} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <button onClick={handleRetry} style={{ width: 140, height: 28, borderRadius: 6, border: '1px solid #bbb', background: '#f6f6f6', color: '#222', fontSize: 15, cursor: 'pointer' }}>Retry</button>
        <button style={{ width: 140, height: 28, borderRadius: 6, border: 'none', background: '#222', color: '#fff', fontSize: 15, cursor: 'pointer' }}>Submit</button>
      </div>
    </div>
  );
}