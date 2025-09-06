import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Accordion from '../components/Accordion'
import { latestReviews, sampleSummary } from '../mockData'
import styles from './FormDetail.module.css'
import { useForms } from '../context/FormsContext'

export default function FormDetail() {
  const nav = useNavigate()
  const { id } = useParams();
  const { forms } = useForms();
  // Try to get form from context first; if not present, fetch from backend
  const ctxForm = forms?.find(f => String(f.id) === String(id));
  const [form, setForm] = useState(ctxForm || {});

  useEffect(() => {
    let cancelled = false;
    async function loadForm() {
      if (ctxForm) {
        setForm(ctxForm);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3000/forms/${id}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setForm(json);
      } catch (err) {
        // ignore; form stays empty
      }
    }
    loadForm();
    return () => { cancelled = true };
  }, [id, ctxForm])

  // Basic KPIs derived from mock data (can wire to real data later)
  const kpis = useMemo(() => ([
    { title: 'Total Reviews', value: latestReviews.length },
    { title: 'Average Rating', value: '4.5' },
    { title: 'Response Rate', value: '92%' },
    { title: 'Last Updated', value: new Date().toLocaleDateString() },
  ]), [])

  // Edit Form state
  const [editTitle, setEditTitle] = useState(form.title || '');
  const [editQuestion, setEditQuestion] = useState(form.question || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editDescription, setEditDescription] = useState(form.description || '');
  
  // Tag-based state for extraction schema
  const [editSentiment, setEditSentiment] = useState([]);
  const [editUsabilityScore, setEditUsabilityScore] = useState([]);
  const [editFeatures, setEditFeatures] = useState([]);
  const [editAiGuidance, setEditAiGuidance] = useState([]);
  
  // Input states for adding new tags
  const [newSentiment, setNewSentiment] = useState('');
  const [newUsabilityScore, setNewUsabilityScore] = useState('');
  const [newFeatures, setNewFeatures] = useState('');
  const [newAiGuidance, setNewAiGuidance] = useState('');
  
  const [editUiHints, setEditUiHints] = useState(
    Array.isArray(form.uiHints) ? form.uiHints.join('\n') : ''
  );
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState('');

  // Update local state when form changes
  useEffect(() => {
    setEditTitle(form.title || '');
    setEditQuestion(form.question || '');
    setEditDescription(form.description || '');
    setEditSentiment(form.extractionSchema?.sentiment?.enum || []);
    setEditUsabilityScore(form.extractionSchema?.usabilityScore?.enum || []);
    setEditFeatures(form.extractionSchema?.features?.enum || []);
    setEditAiGuidance(form.extractionSchema?.aiGuidance?.enum || []);
    setEditUiHints(Array.isArray(form.uiHints) ? form.uiHints.join('\n') : '');
  }, [form]);

  // Helper functions for tag management
  const addTag = (value, setter, inputSetter) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      inputSetter('');
    }
  };

  const removeTag = (index, setter) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e, value, setter, inputSetter) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(value, setter, inputSetter);
    }
  };


  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg('');
    try {
      const patchBody = {
        title: editTitle,
        question: editQuestion,
      };
      if (showAdvanced) {
        patchBody.description = editDescription;
        
        // Build extraction schema with all components
        const newExtractionSchema = { ...form.extractionSchema };
        
        // Always update these fields, even if empty (to allow clearing)
        newExtractionSchema.sentiment = { 
          type: 'string', 
          enum: editSentiment 
        };
        
        newExtractionSchema.usabilityScore = { 
          type: 'string', 
          enum: editUsabilityScore 
        };
        
        newExtractionSchema.features = { 
          type: 'string', 
          enum: editFeatures 
        };
        
        newExtractionSchema.aiGuidance = { 
          type: 'string', 
          enum: editAiGuidance 
        };
        
        patchBody.extractionSchema = newExtractionSchema;
        
        // Always update UI hints, even if empty (to allow clearing)
        patchBody.uiHints = editUiHints ? editUiHints.split('\n').map(s=>s.trim()).filter(Boolean) : [];
      }
      const res = await fetch(`http://localhost:3000/forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      });
      if (!res.ok) throw new Error('Failed to update form');
      const updated = await res.json();
      setForm(updated);
      setEditMsg('Form updated!');
      setShowAdvanced(false);
    } catch (err) {
      setEditMsg('Error updating form.');
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className="container" style={{ paddingTop: 14, paddingBottom: 14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
              <button onClick={()=>nav('/forms')} className={styles.backBtn} aria-label="Back to dashboard">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div>
                <div className={styles.title}>Latest reviews</div>
              </div>
              <Link
                to={`/share/${form.id || id}`}
                state={{ question: form.question }}
                onClick={e => e.stopPropagation()}
                style={{
                  marginLeft: 16,
                  padding: '4px 16px',
                  border: 'none',
                  borderRadius: '16px',
                  background: '#1976d2',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 14,
                  cursor: 'pointer',
                  zIndex: 2,
                  textDecoration: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
                }}
                title="Record"
                aria-label="Record form"
              >Record</Link>
            </div>
            <div className={styles.actions}>
              <div className={styles.meta}>Live</div>
              <input id="toggle" type="checkbox" className="toggle" />
              <div className={styles.toggleLabel}>Turn off Responses</div>
            </div>
          </div>

          {/* KPI strip */}
          <div className={styles.kpiRow}>
            {kpis.map((k) => (
              <div key={k.title} className={styles.kpiCard}>
                <div className={styles.kpiTitle}>{k.title}</div>
                <div className={styles.kpiValue}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="container" style={{ paddingTop: 20, paddingBottom: 24 }}>
        <div className={styles.grid}>
          {/* Summary spans both columns */}
          <div className={styles.summarySpan}>
            <div className={styles.section}>
              <Accordion title="Summary" defaultOpen>
                <div className={styles.sectionBody}>
                  <div className="form-row">
                    <textarea className={styles.searchInput} style={{ minHeight: 120 }} defaultValue={sampleSummary} />
                  </div>
                </div>
              </Accordion>
            </div>
          </div>

          {/* Left column: accordions */}
          <div>
            <div className={styles.section}>
              <Accordion title="View all responses" defaultOpen>
                <div className={styles.sectionBody}>
                  <div className="helper" style={{ marginBottom: 10 }}>This is a placeholder table for responses.</div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Rating</th>
                          <th>Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Guest 1</td>
                          <td>4</td>
                          <td>Loved the food, a bit salty.</td>
                        </tr>
                        <tr>
                          <td>Guest 2</td>
                          <td>5</td>
                          <td>Great experience all around.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Accordion>
            </div>

            <div className={styles.section} style={{ marginTop: 16 }}>
              <Accordion title="Data Analysis and Scorings" defaultOpen>
                <div className={styles.sectionBody}>
                  <p className="helper">Place your analytics, charts or insights here.</p>
                </div>
              </Accordion>
            </div>

            <div className={styles.section} style={{ marginTop: 16 }}>
              <Accordion title="Filter by Date and Time" defaultOpen>
                <div className={styles.sectionBody}>
                  <div className="row">
                    <div className="col" style={{ flex: 1 }}>
                      <label className="label">From</label>
                      <input type="date" className="input" />
                    </div>
                    <div className="col" style={{ flex: 1 }}>
                      <label className="label">To</label>
                      <input type="date" className="input" />
                    </div>
                  </div>
                </div>
              </Accordion>
            </div>

            <div className={styles.section} style={{ marginTop: 16 }}>
              <Accordion title="Search by Keyword" defaultOpen>
                <div className={styles.sectionBody}>
                  <input className={styles.searchInput} placeholder="Type keyword..." />
                </div>
              </Accordion>
            </div>
          </div>

          {/* Right column: Edit Form */}
          <div>
            <div className={styles.section}>
              <div className={styles.sectionBody}>
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <h2 style={{ 
                      margin: 0, 
                      fontSize: 20, 
                      fontWeight: 700, 
                      color: '#111827',
                      letterSpacing: '-0.025em'
                    }}>
                      Edit Form
                    </h2>
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: 14,
                      color: '#6b7280',
                      fontWeight: 400
                    }}>
                      Update your form details and configuration
                    </p>
                  </div>
                </div>

                {/* Basic Edit Form */}
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Form Title Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#374151',
                      letterSpacing: '-0.01em'
                    }}>
                      Form Title
                    </label>
                    <input 
                      className="input" 
                      value={editTitle} 
                      onChange={e=>setEditTitle(e.target.value)} 
                      placeholder="Enter form title"
                      required
                      style={{
                        padding: '12px 16px',
                        fontSize: 14,
                        border: '1.5px solid #d1d5db',
                        borderRadius: 8,
                        transition: 'all 0.2s ease',
                        backgroundColor: '#ffffff'
                      }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Form Question Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#374151',
                      letterSpacing: '-0.01em'
                    }}>
                      Form Question
                    </label>
                    <input 
                      className="input" 
                      value={editQuestion} 
                      onChange={e=>setEditQuestion(e.target.value)} 
                      placeholder="Enter form question"
                      required
                      style={{
                        padding: '12px 16px',
                        fontSize: 14,
                        border: '1.5px solid #d1d5db',
                        borderRadius: 8,
                        transition: 'all 0.2s ease',
                        backgroundColor: '#ffffff'
                      }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: 8,
                    paddingTop: 16,
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <button 
                      className="btn" 
                      type="submit" 
                      disabled={editLoading}
                      style={{
                        minWidth: 120,
                        padding: '12px 24px',
                        backgroundColor: editLoading ? '#9ca3af' : '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: editLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        letterSpacing: '-0.01em'
                      }}
                      onMouseEnter={e => {
                        if (!editLoading) e.target.style.backgroundColor = '#2563eb'
                      }}
                      onMouseLeave={e => {
                        if (!editLoading) e.target.style.backgroundColor = '#3b82f6'
                      }}
                    >
                      {editLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 14,
                            height: 14,
                            border: '2px solid #ffffff',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Saving...
                        </span>
                      ) : 'Save Changes'}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={()=>setShowAdvanced(true)}
                      style={{
                        minWidth: 140,
                        padding: '12px 24px',
                        backgroundColor: '#f8fafc',
                        color: '#475569',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        letterSpacing: '-0.01em'
                      }}
                      onMouseEnter={e => {
                        e.target.style.backgroundColor = '#f1f5f9'
                        e.target.style.borderColor = '#cbd5e1'
                      }}
                      onMouseLeave={e => {
                        e.target.style.backgroundColor = '#f8fafc'
                        e.target.style.borderColor = '#e2e8f0'
                      }}
                    >
                      Advanced Options
                    </button>
                  </div>

                  {/* Status Message */}
                  {editMsg && (
                    <div style={{
                      marginTop: 12,
                      padding: '12px 16px',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      backgroundColor: editMsg.startsWith('Error') ? '#fef2f2' : '#f0fdf4',
                      color: editMsg.startsWith('Error') ? '#dc2626' : '#16a34a',
                      border: `1px solid ${editMsg.startsWith('Error') ? '#fecaca' : '#bbf7d0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: editMsg.startsWith('Error') ? '#dc2626' : '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 700
                      }}>
                        {editMsg.startsWith('Error') ? '!' : '✓'}
                      </div>
                      {editMsg}
                    </div>
                  )}
                </form>

                {/* Advanced Edit Modal */}
                {showAdvanced && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                  }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 16,
                      padding: 32,
                      minWidth: 480,
                      maxWidth: 560,
                      maxHeight: 'calc(100vh - 80px)',
                      overflowY: 'auto',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      position: 'relative',
                      border: '1px solid #e5e7eb'
                    }}>
                      {/* Modal Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 24,
                        paddingBottom: 16,
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <div>
                          <h3 style={{
                            margin: 0,
                            fontSize: 20,
                            fontWeight: 700,
                            color: '#111827',
                            letterSpacing: '-0.025em'
                          }}>
                            Advanced Configuration
                          </h3>
                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: 14,
                            color: '#6b7280'
                          }}>
                            Configure advanced form settings and analysis options
                          </p>
                        </div>
                        <button 
                          onClick={()=>setShowAdvanced(false)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            fontWeight: 500,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => {
                            e.target.style.backgroundColor = '#e5e7eb'
                            e.target.style.color = '#374151'
                          }}
                          onMouseLeave={e => {
                            e.target.style.backgroundColor = '#f3f4f6'
                            e.target.style.color = '#6b7280'
                          }}
                        >
                          ×
                        </button>
                      </div>

                      {/* Modal Content */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Description Field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#374151',
                            letterSpacing: '-0.01em'
                          }}>
                            Form Description
                          </label>
                          <textarea 
                            value={editDescription} 
                            onChange={e=>setEditDescription(e.target.value)} 
                            placeholder="Provide a detailed description of your form..."
                            style={{
                              minHeight: 60,
                              padding: '12px 16px',
                              fontSize: 14,
                              border: '1.5px solid #d1d5db',
                              borderRadius: 8,
                              resize: 'vertical',
                              fontFamily: 'inherit',
                              lineHeight: '1.5',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = '#d1d5db'}
                          />
                        </div>

                        {/* Extraction Schema Section */}
                        <div style={{
                          padding: '16px',
                          backgroundColor: '#f8fafc',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0'
                        }}>
                          <h4 style={{
                            margin: '0 0 12px 0',
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#374151'
                          }}>
                            Analysis Configuration
                          </h4>
                          <p style={{
                            margin: '0 0 16px 0',
                            fontSize: 12,
                            color: '#6b7280',
                            fontStyle: 'italic'
                          }}>
                            Edit existing analysis options or add new ones (comma-separated)
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Sentiment Analysis */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <label style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#475569'
                              }}>
                                Sentiment Analysis
                              </label>
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 6,
                                marginBottom: 8,
                                minHeight: 32,
                                padding: '8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                backgroundColor: '#ffffff'
                              }}>
                                {editSentiment.map((tag, index) => (
                                  <span key={index} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 8px',
                                    backgroundColor: '#dbeafe',
                                    color: '#1e40af',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 500
                                  }}>
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => removeTag(index, setEditSentiment)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#1e40af',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        padding: 0,
                                        marginLeft: 2
                                      }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <input
                                  value={newSentiment}
                                  onChange={e => setNewSentiment(e.target.value)}
                                  onKeyDown={e => handleKeyDown(e, newSentiment, setEditSentiment, setNewSentiment)}
                                  placeholder="Add sentiment option..."
                                  style={{
                                    flex: 1,
                                    padding: '8px 10px',
                                    fontSize: 12,
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 4,
                                    backgroundColor: '#ffffff'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => addTag(newSentiment, setEditSentiment, setNewSentiment)}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>

                            {/* Usability Score */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <label style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#475569'
                              }}>
                                Usability Score
                              </label>
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 6,
                                marginBottom: 8,
                                minHeight: 32,
                                padding: '8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                backgroundColor: '#ffffff'
                              }}>
                                {editUsabilityScore.map((tag, index) => (
                                  <span key={index} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 8px',
                                    backgroundColor: '#dcfce7',
                                    color: '#15803d',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 500
                                  }}>
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => removeTag(index, setEditUsabilityScore)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#15803d',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        padding: 0,
                                        marginLeft: 2
                                      }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <input
                                  value={newUsabilityScore}
                                  onChange={e => setNewUsabilityScore(e.target.value)}
                                  onKeyDown={e => handleKeyDown(e, newUsabilityScore, setEditUsabilityScore, setNewUsabilityScore)}
                                  placeholder="Add usability score..."
                                  style={{
                                    flex: 1,
                                    padding: '8px 10px',
                                    fontSize: 12,
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 4,
                                    backgroundColor: '#ffffff'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => addTag(newUsabilityScore, setEditUsabilityScore, setNewUsabilityScore)}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>

                            {/* Features */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <label style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#475569'
                              }}>
                                Features Mentioned
                              </label>
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 6,
                                marginBottom: 8,
                                minHeight: 32,
                                padding: '8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                backgroundColor: '#ffffff'
                              }}>
                                {editFeatures.map((tag, index) => (
                                  <span key={index} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 8px',
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 500
                                  }}>
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => removeTag(index, setEditFeatures)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#92400e',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        padding: 0,
                                        marginLeft: 2
                                      }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <input
                                  value={newFeatures}
                                  onChange={e => setNewFeatures(e.target.value)}
                                  onKeyDown={e => handleKeyDown(e, newFeatures, setEditFeatures, setNewFeatures)}
                                  placeholder="Add feature..."
                                  style={{
                                    flex: 1,
                                    padding: '8px 10px',
                                    fontSize: 12,
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 4,
                                    backgroundColor: '#ffffff'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => addTag(newFeatures, setEditFeatures, setNewFeatures)}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>

                            {/* AI Guidance */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <label style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#475569'
                              }}>
                                AI Guidance
                              </label>
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 6,
                                marginBottom: 8,
                                minHeight: 32,
                                padding: '8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                backgroundColor: '#ffffff'
                              }}>
                                {editAiGuidance.map((tag, index) => (
                                  <span key={index} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 8px',
                                    backgroundColor: '#f3e8ff',
                                    color: '#7c3aed',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 500
                                  }}>
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => removeTag(index, setEditAiGuidance)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#7c3aed',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        padding: 0,
                                        marginLeft: 2
                                      }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <input
                                  value={newAiGuidance}
                                  onChange={e => setNewAiGuidance(e.target.value)}
                                  onKeyDown={e => handleKeyDown(e, newAiGuidance, setEditAiGuidance, setNewAiGuidance)}
                                  placeholder="Add AI guidance option..."
                                  style={{
                                    flex: 1,
                                    padding: '8px 10px',
                                    fontSize: 12,
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 4,
                                    backgroundColor: '#ffffff'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => addTag(newAiGuidance, setEditAiGuidance, setNewAiGuidance)}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* UI Hints Field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#374151',
                            letterSpacing: '-0.01em'
                          }}>
                            UI Hints
                          </label>
                          <textarea 
                            value={editUiHints} 
                            onChange={e=>setEditUiHints(e.target.value)} 
                            placeholder="Enter UI hints (one per line)..."
                            style={{
                              minHeight: 60,
                              padding: '12px 16px',
                              fontSize: 14,
                              border: '1.5px solid #d1d5db',
                              borderRadius: 8,
                              resize: 'vertical',
                              fontFamily: 'inherit',
                              lineHeight: '1.5',
                              transition: 'all 0.2s ease'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = '#d1d5db'}
                          />
                          <p style={{
                            margin: 0,
                            fontSize: 12,
                            color: '#6b7280',
                            fontStyle: 'italic'
                          }}>
                            Each line represents a separate UI hint for better user experience
                          </p>
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div style={{
                        display: 'flex',
                        gap: 12,
                        marginTop: 32,
                        paddingTop: 20,
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        <button 
                          onClick={handleEditSubmit} 
                          disabled={editLoading}
                          style={{
                            flex: 1,
                            padding: '12px 24px',
                            backgroundColor: editLoading ? '#9ca3af' : '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: editLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            letterSpacing: '-0.01em'
                          }}
                          onMouseEnter={e => {
                            if (!editLoading) e.target.style.backgroundColor = '#2563eb'
                          }}
                          onMouseLeave={e => {
                            if (!editLoading) e.target.style.backgroundColor = '#3b82f6'
                          }}
                        >
                          {editLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                              <div style={{
                                width: 14,
                                height: 14,
                                border: '2px solid #ffffff',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }} />
                              Saving Changes...
                            </span>
                          ) : 'Save Advanced Settings'}
                        </button>
                        
                        <button 
                          onClick={()=>setShowAdvanced(false)}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: '#f8fafc',
                            color: '#475569',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            letterSpacing: '-0.01em'
                          }}
                          onMouseEnter={e => {
                            e.target.style.backgroundColor = '#f1f5f9'
                            e.target.style.borderColor = '#cbd5e1'
                          }}
                          onMouseLeave={e => {
                            e.target.style.backgroundColor = '#f8fafc'
                            e.target.style.borderColor = '#e2e8f0'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}