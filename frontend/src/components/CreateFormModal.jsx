import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const USABILITY_PRESETS = [
  { label: '1-5 (Likert)', value: { type: 'number', min: 1, max: 5 } },
  { label: '1-10 (Default)', value: { type: 'number', min: 1, max: 10 } },
  { label: 'Pass/Fail', value: { type: 'string', enum: ['Pass', 'Fail'] } },
  { label: 'Excellent/Good/Fair/Poor', value: { type: 'string', enum: ['Excellent', 'Good', 'Fair', 'Poor'] } },
  { label: 'Custom', value: null },
];
const SENTIMENT_PRESETS = [
  'positive', 'negative', 'neutral', 'very positive', 'very negative', 'mixed', 'confused', 'bored', 'excited'
];
const FEATURE_PRESETS = [
  'Lectures', 'Recitation Sessions', 'Online Quizzes', 'Assignments', 'Labs', 'Office Hours', 'Course Website', 'Textbook', 'Group Projects', 'Exams'
];
const UI_HINTS_PRESETS = [
  'Rate the lectures',
  'Mention what you liked/disliked',
  'Suggest improvements',
  'Comment on assignments or quizzes',
  'Share thoughts on recitation sessions',
];

export default function CreateFormModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Extraction schema state
  const [usabilityPreset, setUsabilityPreset] = useState(USABILITY_PRESETS[1].label);
  const [usabilityCustom, setUsabilityCustom] = useState({ min: 1, max: 10 });
  const [sentiments, setSentiments] = useState(['positive', 'negative', 'neutral']);
  const [features, setFeatures] = useState([...FEATURE_PRESETS]);
  const [suggestionsGuidance, setSuggestionsGuidance] = useState('');
  const [uiHints, setUiHints] = useState([...UI_HINTS_PRESETS]);
  const [newHint, setNewHint] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const { user } = useAuth();
  const ownerId = (user && user.userId) || localStorage.getItem('userId');

  // Build extractionSchema dynamically
  const extractionSchema = {};
  // Usability
  if (usabilityPreset === 'Custom') {
    extractionSchema.usabilityScore = { type: 'number', min: Number(usabilityCustom.min), max: Number(usabilityCustom.max) };
  } else {
    const preset = USABILITY_PRESETS.find(p => p.label === usabilityPreset);
    if (preset && preset.value) extractionSchema.usabilityScore = preset.value;
  }
  // Sentiment
  if (sentiments.length > 0) {
    extractionSchema.sentiment = { type: 'string', enum: sentiments };
  }
  // Features
  if (features.length > 0) {
    extractionSchema.features = { type: 'array', items: { type: 'string', enum: features } };
  }
  // Suggestions (always enabled)
  extractionSchema.suggestions = { 
    type: 'string',
    ...(suggestionsGuidance && { guidance: suggestionsGuidance })
  };

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!ownerId) {
      setMessage('User ID missing. Please log in again.');
      setLoading(false);
      return;
    }
    if (!title || !question) {
      setMessage('Title and Question are required.');
      setLoading(false);
      return;
    }
    // Only send optional fields if filled
    const body = {
      title,
      question,
      ...(description && { description }),
      extractionSchema,
      ...(uiHints.length > 0 && { uiHints }),
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

  // UI Handlers
  function addHint() {
    if (newHint.trim() && !uiHints.includes(newHint.trim())) {
      setUiHints([...uiHints, newHint.trim()]);
      setNewHint('');
    }
  }
  function removeHint(hint) {
    setUiHints(uiHints.filter(h => h !== hint));
  }
  function addFeature() {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  }
  function removeFeature(f) {
    setFeatures(features.filter(x => x !== f));
  }
  function addSentiment(s) {
    if (s && !sentiments.includes(s)) setSentiments([...sentiments, s]);
  }
  function removeSentiment(s) {
    setSentiments(sentiments.filter(x => x !== s));
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 32px 0 32px',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky',
          top: 0,
          background: '#ffffff',
          borderRadius: '16px 16px 0 0',
          zIndex: 10,
        }}>
          <button 
            onClick={onClose} 
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#64748b',
              fontSize: '18px',
            }}
            onMouseEnter={e => e.target.style.background = '#f1f5f9'}
            onMouseLeave={e => e.target.style.background = '#f8fafc'}
          >
            ✕
          </button>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '8px',
          }}>
            Create New Form
          </h2>
          <p style={{
            margin: 0,
            color: '#64748b',
            fontSize: '16px',
            marginBottom: '24px',
          }}>
            Design your feedback form to capture valuable insights from students
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0',
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#3b82f6' }}>📝</span>
                Basic Information
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                  placeholder="e.g., Data Structures Course Feedback"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Question <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                  placeholder="e.g., What are your thoughts on the course content and teaching style?"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Description <span style={{ color: '#64748b', fontWeight: '400' }}>(optional)</span>
                </label>
                <textarea 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none',
                    background: '#ffffff',
                    minHeight: '80px',
                    resize: 'vertical',
                  }}
                  placeholder="Provide additional context about your feedback form..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Data Extraction Section */}
            <div style={{
              background: '#fefce8',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #fef3c7',
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#f59e0b' }}>🎯</span>
                Data Extraction Schema
              </h3>
              <p style={{
                margin: '0 0 20px 0',
                fontSize: '14px',
                color: '#78716c',
                lineHeight: '1.5',
              }}>
                Configure what structured data should be extracted from student responses
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '20px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px',
                  }}>
                    Rating Scale
                  </label>
                  <select 
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      background: '#ffffff',
                      outline: 'none',
                    }}
                    value={usabilityPreset}
                    onChange={e => setUsabilityPreset(e.target.value)}
                  >
                    {USABILITY_PRESETS.map(p => (
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                  {usabilityPreset === 'Custom' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input 
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          background: '#ffffff',
                        }}
                        type="number"
                        min={1}
                        max={100}
                        value={usabilityCustom.min}
                        onChange={e => setUsabilityCustom({...usabilityCustom, min: e.target.value})}
                        placeholder="Min"
                      />
                      <input 
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          background: '#ffffff',
                        }}
                        type="number"
                        min={1}
                        max={100}
                        value={usabilityCustom.max}
                        onChange={e => setUsabilityCustom({...usabilityCustom, max: e.target.value})}
                        placeholder="Max"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px',
                  }}>
                    Sentiment Analysis
                  </label>
                  <div style={{
                    background: '#ffffff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    minHeight: '48px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    alignItems: 'flex-start',
                  }}>
                    {sentiments.map(s => (
                      <span key={s} style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        {s}
                        <button 
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                          }}
                          onClick={() => removeSentiment(s)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <select 
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: '12px',
                        color: '#6b7280',
                        outline: 'none',
                        cursor: 'pointer',
                        minWidth: '60px',
                      }}
                      onChange={e => addSentiment(e.target.value)}
                      value=""
                    >
                      <option value="">+ Add</option>
                      {SENTIMENT_PRESETS.filter(s => !sentiments.includes(s)).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  Course Features <span style={{ color: '#64748b', fontWeight: '400' }}>(students can mention)</span>
                </label>
                <div style={{
                  background: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  minHeight: '60px',
                }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '8px',
                  }}>
                    {features.map(f => (
                      <span key={f} style={{
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        {f}
                        <button 
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                          }}
                          onClick={() => removeFeature(f)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                        padding: '4px 0',
                        background: 'transparent',
                      }}
                      placeholder="Add new feature..."
                      value={newFeature}
                      onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), addFeature()) : null}
                    />
                    <button 
                      type="button"
                      style={{
                        background: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                      onClick={addFeature}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                }}>
                  AI Guidance for Suggestions <span style={{ color: '#64748b', fontWeight: '400' }}>(optional)</span>
                </label>
                <textarea 
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none',
                    background: '#ffffff',
                    minHeight: '80px',
                    resize: 'vertical',
                  }}
                  placeholder="e.g., Focus on extracting specific improvement ideas for course content, teaching methods, or student engagement. Look for actionable feedback that can be implemented next semester..."
                  value={suggestionsGuidance}
                  onChange={e => setSuggestionsGuidance(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  Provide specific instructions to guide the AI on what types of suggestions to extract from student responses
                </div>
              </div>
            </div>

            {/* UI Hints Section */}
            <div style={{
              background: '#fef7ff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid #f3e8ff',
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ color: '#a855f7' }}>💡</span>
                UI Hints for Students
              </h3>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                color: '#78716c',
                lineHeight: '1.5',
              }}>
                Provide helpful prompts to guide students on what to include in their responses
              </p>
              
              <div style={{
                background: '#ffffff',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                minHeight: '60px',
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '8px',
                }}>
                  {uiHints.map(hint => (
                    <span key={hint} style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      padding: '4px 8px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {hint}
                      <button 
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                        }}
                        onClick={() => removeHint(hint)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      padding: '4px 0',
                      background: 'transparent',
                    }}
                    placeholder="Add helpful hint..."
                    value={newHint}
                    onChange={e => setNewHint(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), addHint()) : null}
                  />
                  <button 
                    type="button"
                    style={{
                      background: '#a855f7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                    onClick={addHint}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                {message && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: message.startsWith("Error") ? '#fef2f2' : '#f0fdf4',
                    color: message.startsWith("Error") ? '#dc2626' : '#16a34a',
                    border: `1px solid ${message.startsWith("Error") ? '#fecaca' : '#bbf7d0'}`,
                  }}>
                    {message}
                  </div>
                )}
              </div>
              <button 
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: loading ? 'none' : '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
                  minWidth: '140px',
                }}
                onMouseEnter={e => !loading && (e.target.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => !loading && (e.target.style.transform = 'translateY(0)')}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}></span>
                    Creating...
                  </span>
                ) : (
                  'Create Form'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}