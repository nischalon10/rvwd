import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function SharePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const question = location.state?.question || 'No question provided.';
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false };
  }, []);

  // Timer for recording elapsed time
  useEffect(() => {
    let timer;
    if (recording) {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(timer);
  }, [recording]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
        <div style={{textAlign:'center',maxWidth:560,padding:24}}>
          <h2 style={{marginBottom:8}}>Speech recognition not supported</h2>
          <p style={{color:'#666'}}>Your browser doesn't support the Web Speech API required for recording. Please use a modern desktop browser like Chrome or Edge.</p>
        </div>
      </div>
    );
  }

  const handleCircleClick = () => {
    if (!recording) {
      setStatusMessage('Recording... speak clearly into your microphone');
      setRecording(true);
      SpeechRecognition.startListening({ continuous: true });
    } else {
      setRecording(false);
      SpeechRecognition.stopListening();
      setStatusMessage('Recording stopped. You can listen to the transcript and submit.');
    }
  };

  const handleRetry = () => {
    setRecording(false);
    SpeechRecognition.stopListening();
    resetTranscript();
    setStatusMessage('Ready to record.');
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async () => {
    if (!transcript) {
      setStatusMessage('Please record your response before submitting.');
      return;
    }
    setSubmitting(true);
    setStatusMessage('Submitting response...');

    const metadata = {
      browser: navigator.userAgent,
      timestamp: new Date().toISOString(),
      duration: seconds,
    };

    try {
      const res = await fetch('http://localhost:3000/responses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: id, transcript, metadata }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Server returned an error');
      }
      setStatusMessage('Response submitted successfully. Redirecting...');
      setTimeout(() => navigate('/forms'), 900);
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to submit response. Please try again.');
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f4f6fb',padding:24}}>
      <style>{`
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(25,118,210,0.25); } 70% { box-shadow: 0 0 0 18px rgba(25,118,210,0); } 100% { box-shadow: 0 0 0 0 rgba(25,118,210,0); } }
      `}</style>

      <div style={{width:'100%',maxWidth:980,background:'#ffffff',borderRadius:12,boxShadow:'0 10px 30px rgba(12,24,50,0.08)',padding:28,display:'flex',gap:24,alignItems:'stretch'}}>
        {/* Left column: question + controls */}
        <div style={{flex:'0 0 420px',display:'flex',flexDirection:'column',gap:16}}>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <div style={{fontSize:18,fontWeight:700,color:'#0f1724'}}>Respond to</div>
            <h2 style={{margin:0,fontSize:22,fontWeight:700,color:'#0b1220',lineHeight:1.25}}>{question}</h2>
            <div style={{color:'#6b7280',fontSize:13,marginTop:8}}>Tap the big record button and speak. When finished, tap again to stop and submit your response.</div>
          </div>

          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,marginTop:8}}>
            <div
              role="button"
              aria-pressed={recording}
              onClick={handleCircleClick}
              style={{
                width:150,
                height:150,
                borderRadius:75,
                background: recording ? '#d32f2f' : 'linear-gradient(180deg,#0b74ff,#195bd8)',
                display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
                boxShadow: recording ? '0 6px 30px rgba(211,47,47,0.18)' : '0 8px 26px rgba(9,30,66,0.08)',
                animation: recording ? 'pulse 1.8s infinite' : 'none',
                transition:'transform 160ms ease, box-shadow 160ms ease'
              }}
            >
              {!recording ? (
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5z" fill="#fff"/></svg>
              ) : (
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><rect x="7" y="7" width="10" height="10" rx="2" fill="#fff"/></svg>
              )}
            </div>

            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <div style={{fontSize:13,color:recording ? '#dc2626' : '#374151',fontWeight:600}}>{recording ? 'Recording' : 'Ready'}</div>
              <div style={{height:6,width:6,borderRadius:6,background:recording ? '#dc2626' : '#c7d2fe'}} />
              <div style={{color:'#6b7280',fontSize:13,fontFeatureSettings:'"tnum"',fontVariantNumeric:'tabular-nums'}}>{formatTime(seconds)}</div>
            </div>

            <div style={{width:'100%',padding:12,background:'#f8fafc',borderRadius:8,border:'1px solid #eef2ff',textAlign:'center',color:'#475569'}}>
              <div style={{fontSize:13,fontWeight:700}}>Waveform</div>
              <div style={{height:28,marginTop:8,display:'flex',alignItems:'center',gap:6,justifyContent:'center'}}>
                {/* Simple animated bars as placeholder */}
                {[0,1,2,3,4,5,6].map((n) => (
                  <div key={n} style={{width:6,height: Math.max(6, (recording ? (10 + (n * 6)) : 8) ),background:'#c7d2fe',borderRadius:3,opacity:recording ? (0.6 + (n * 0.05)) : 0.6,transition:'height 220ms ease'}} />
                ))}
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button onClick={handleRetry} style={{flex:1,padding:'10px 12px',borderRadius:8,border:'1px solid #e6eef9',background:'#fff',color:'#0b1220',fontWeight:600,cursor:'pointer'}}>Retry</button>
            <button onClick={handleSubmit} disabled={submitting} style={{flex:1,padding:'10px 12px',borderRadius:8,border:'none',background:'#0b74ff',color:'#fff',fontWeight:700,cursor:'pointer',boxShadow:'0 6px 18px rgba(11,116,255,0.12)'}}>{submitting ? 'Submitting...' : 'Submit'}</button>
          </div>

          {statusMessage && <div style={{marginTop:10,color:'#374151',fontSize:13}}>{statusMessage}</div>}
        </div>

        {/* Right column: transcript and details */}
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:14,fontWeight:700,color:'#0b1220'}}>Transcript</div>
            <div style={{fontSize:12,color:'#9ca3af'}}>{transcript ? `${transcript.length} chars` : 'No text yet'}</div>
          </div>

          <div style={{flex:1, background: '#ffffff', borderRadius:10, overflow:'hidden', boxShadow: 'inset 0 1px 0 rgba(16,24,40,0.03)'}}>
            <textarea
              readOnly
              value={transcript}
              placeholder="Your spoken words will appear here..."
              style={{width:'100%',height:'100%',minHeight:220,resize:'none',border:'none',outline:'none',padding:18,background:'linear-gradient(180deg,#ffffff,#fbfdff)',color:'#061427',fontSize:15,lineHeight:1.5}}
            />
          </div>

          <div style={{display:'flex',gap:12,alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div style={{width:10,height:10,borderRadius:8,background:'#e6eef9'}} />
              <div style={{fontSize:13,color:'#6b7280'}}>Browser: <span style={{color:'#111827',fontWeight:700}}> {navigator.userAgent.split(' ')[0]}</span></div>
            </div>
            <div style={{fontSize:12,color:'#9ca3af'}}>Tip: Speak in complete sentences for better transcription results</div>
          </div>

        </div>
      </div>
    </div>
  );
}