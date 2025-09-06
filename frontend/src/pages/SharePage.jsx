import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function SharePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve form id robustly
  const resolvedFormId = (() => {
    if (id && id !== 'undefined') return id;
    if (location.state?.formId) return location.state.formId;
    if (location.state?.id) return location.state.id;
    const q = new URLSearchParams(location.search).get('id');
    if (q) return q;
    return undefined;
  })();

  const question = location.state?.question || 'No question provided.';
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(true);
  const [checkingForm, setCheckingForm] = useState(true);
  const [formData, setFormData] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const id = requestAnimationFrame(() => setMounted(true));
    
    // Check for reduced motion preference
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduceMotion(mql.matches);
      const onChange = (e) => setReduceMotion(e.matches);
      mql.addEventListener?.('change', onChange);
      mql.addListener?.(onChange);
      return () => {
        cancelAnimationFrame(id);
        mountedRef.current = false;
        mql.removeEventListener?.('change', onChange);
        mql.removeListener?.(onChange);
      };
    }
    
    return () => { 
      cancelAnimationFrame(id);
      mountedRef.current = false; 
    };
  }, []);

  // Fetch form data including UI hints
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/forms/${resolvedFormId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        } else {
          console.error('Failed to fetch form data');
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    if (resolvedFormId) {
      fetchFormData();
    }
  }, [resolvedFormId]);

  // Timer for recording elapsed time
  useEffect(() => {
    let timer;
    if (recording) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(timer);
  }, [recording]);

  // Verify form exists and is active
  useEffect(() => {
    let cancelled = false;
    async function checkForm() {
      setCheckingForm(true);
      if (!resolvedFormId) {
        setFormValid(false);
        setStatusMessage('Invalid form ID.');
        setCheckingForm(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/forms/${resolvedFormId}`);
        if (!res.ok) {
          const text = await res.text();
          setFormValid(false);
          setStatusMessage(text || 'Form not found');
        } else {
          const json = await res.json();
          if (!cancelled) {
            if (!json || json.isActive === false) {
              setFormValid(false);
              setStatusMessage('This form is not accepting responses.');
            } else {
              setFormValid(true);
              setStatusMessage('');
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setFormValid(false);
          setStatusMessage('Unable to verify form. Is the backend running?');
        }
      } finally {
        if (!cancelled) setCheckingForm(false);
      }
    }
    checkForm();
    return () => { cancelled = true };
  }, [resolvedFormId]);

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
    if (!resolvedFormId) {
      setStatusMessage('Invalid form id — cannot submit.');
      return;
    }
    if (!transcript) {
      setStatusMessage('Please record your response before submitting.');
      return;
    }
    if (!formValid) {
      setStatusMessage('Cannot submit: invalid form.');
      return;
    }

    setSubmitting(true);
    setStatusMessage('Submitting response...');

    const metadata = {
      timestamp: new Date().toISOString(),
      duration: seconds,
      anonymous: true
    };

    try {
      const res = await fetch('http://localhost:3000/responses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: resolvedFormId, transcript, metadata }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server returned ${res.status}`);
      }
      setStatusMessage('Response submitted successfully. Redirecting...');
      setTimeout(() => navigate('/forms'), 900);
    } catch (err) {
      console.error(err);
      setStatusMessage(err?.message || 'Failed to submit response. Please try again.');
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(148, 163, 184, 0.15) 0%, transparent 50%)
        `,
        animation: reduceMotion ? 'none' : 'float 20s ease-in-out infinite'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1); }
          50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes record-pulse {
          0% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.4); }
          70% { box-shadow: 0 0 0 25px rgba(248, 113, 113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-up {
          animation: ${reduceMotion ? 'none' : 'slide-up 0.8s ease-out forwards'};
        }
        .waveform-bar {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div 
          className={mounted ? 'slide-up' : ''} 
          style={{
            width: '100%',
            maxWidth: '1100px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            display: 'flex',
            gap: '40px',
            alignItems: 'stretch',
            opacity: mounted ? 1 : 0
          }}
        >
          {/* Left Panel - Recording Interface */}
          <div style={{
            flex: '0 0 420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                padding: '6px 14px',
                borderRadius: '18px',
                border: '1px solid #bae6fd',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#075985',
                  letterSpacing: '0.025em'
                }}>Fully Anonymous Response</span>
              </div>
              
              <h1 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                lineHeight: '1.2',
                marginBottom: '6px'
              }}>
                {formData?.title || 'Voice Response'}
              </h1>
              
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#475569',
                lineHeight: '1.3'
              }}>
                {question}
              </h2>
            </div>

            {/* UI Hints Display */}
            {formData?.uiHints && formData.uiHints.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '1px solid #f59e0b',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '6px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#f59e0b"/>
                  </svg>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#92400e'
                  }}>Response Guidelines</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {formData.uiHints.map((hint, index) => (
                    <div key={index} style={{
                      fontSize: '13px',
                      color: '#a16207',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px'
                    }}>
                      <span style={{ color: '#f59e0b', fontWeight: '600' }}>•</span>
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recording Button */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              padding: '24px 0'
            }}>
              <div
                role="button"
                aria-pressed={recording}
                onClick={handleCircleClick}
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  background: recording 
                    ? 'linear-gradient(135deg, #f87171, #dc2626)' 
                    : 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '3px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: recording 
                    ? '0 8px 25px rgba(248, 113, 113, 0.3)' 
                    : '0 8px 25px rgba(59, 130, 246, 0.3)',
                  animation: recording ? (reduceMotion ? 'none' : 'record-pulse 2s infinite') : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'scale(1)',
                  ':hover': {
                    transform: 'scale(1.05)'
                  }
                }}
                onMouseEnter={(e) => {
                  if (!reduceMotion) e.target.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  if (!reduceMotion) e.target.style.transform = 'scale(1)'
                }}
              >
                {!recording ? (
                  <svg width="55" height="55" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7L8 5z" fill="white"/>
                  </svg>
                ) : (
                  <svg width="55" height="55" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="6" width="12" height="12" rx="3" fill="white"/>
                  </svg>
                )}
              </div>

              {/* Status and Timer */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(248, 250, 252, 0.8)',
                  padding: '10px 18px',
                  borderRadius: '18px',
                  border: '1px solid rgba(226, 232, 240, 0.5)'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: recording ? '#ef4444' : (formValid ? '#22c55e' : '#f97316'),
                    animation: recording ? (reduceMotion ? 'none' : 'pulse-glow 2s infinite') : 'none'
                  }} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: recording ? '#dc2626' : (formValid ? '#166534' : '#ea580c')
                  }}>
                    {recording ? 'Recording...' : (checkingForm ? 'Loading...' : (formValid ? 'Ready to Record' : 'Form Unavailable'))}
                  </span>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#475569',
                    fontFeatureSettings: '"tnum"',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {formatTime(seconds)}
                  </div>
                </div>
              </div>
            </div>

            {/* Waveform Visualization */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: '14px',
              padding: '18px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '12px',
                textAlign: 'center'
              }}>Audio Waveform</div>
              <div style={{
                height: '50px',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                gap: '3px'
              }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="waveform-bar"
                    style={{
                      width: '6px',
                      height: recording 
                        ? `${Math.max(6, 16 + Math.sin((Date.now() / 200) + i) * 20)}px`
                        : '10px',
                      background: recording 
                        ? `linear-gradient(180deg, #60a5fa, #3b82f6)`
                        : '#cbd5e1',
                      borderRadius: '3px',
                      opacity: recording ? 0.8 + (Math.sin((Date.now() / 300) + i) * 0.2) : 0.6
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '6px'
            }}>
              <button 
                onClick={handleRetry}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    borderColor: '#cbd5e1',
                    transform: 'translateY(-1px)'
                  }
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#cbd5e1'
                  if (!reduceMotion) e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  if (!reduceMotion) e.target.style.transform = 'translateY(0)'
                }}
              >
                Clear & Retry
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting || !formValid || !transcript}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: (!formValid || !transcript) 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: (!formValid || !transcript) ? 'not-allowed' : 'pointer',
                  boxShadow: (!formValid || !transcript) 
                    ? 'none' 
                    : '0 6px 16px rgba(34, 197, 94, 0.25)',
                  transition: 'all 0.2s ease',
                  ':hover': !(!formValid || !transcript) ? {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 20px rgba(34, 197, 94, 0.35)'
                  } : {}
                }}
                onMouseEnter={(e) => {
                  if (!(!formValid || !transcript) && !reduceMotion) {
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.35)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!formValid || !transcript) && !reduceMotion) {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.25)'
                  }
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                border: '1px solid #93c5fd',
                borderRadius: '10px',
                padding: '12px',
                color: '#1e40af',
                fontSize: '13px',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                {statusMessage}
              </div>
            )}
          </div>

          {/* Right Panel - Transcript */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '10px',
              borderBottom: '2px solid #f1f5f9'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '700',
                color: '#1e293b'
              }}>Live Transcript</h3>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                background: '#f8fafc',
                padding: '4px 10px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                {transcript ? `${transcript.length} characters` : 'Waiting for speech...'}
              </div>
            </div>

            <div style={{
              flex: 1,
              background: 'linear-gradient(135deg, #ffffff, #fafbfc)',
              borderRadius: '14px',
              border: '2px solid #f1f5f9',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <textarea
                readOnly
                value={transcript}
                placeholder="Start recording to see your spoken words appear here in real-time..."
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '240px',
                  resize: 'none',
                  border: 'none',
                  outline: 'none',
                  padding: '20px',
                  background: 'transparent',
                  color: '#1e293b',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              />
              {!transcript && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#94a3b8'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" opacity="0.3"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <path d="M12 19v4m-4 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: '13px', textAlign: 'center' }}>
                    Click the record button to start capturing your voice
                  </span>
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="white"/>
                  <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#166534',
                  marginBottom: '2px'
                }}>Your Privacy is Protected</div>
                <div style={{
                  fontSize: '12px',
                  color: '#15803d',
                  lineHeight: '1.4'
                }}>
                  This response is completely anonymous. No personal information, browser data, or identifying details are collected.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}