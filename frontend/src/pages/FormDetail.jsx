import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Accordion from '../components/Accordion'
import { latestReviews, sampleSummary } from '../mockData'
import styles from './FormDetail.module.css'
import { useForms } from '../context/FormsContext'

export default function FormDetail() {
  const nav = useNavigate()
  const { id } = useParams();
  const { forms } = useForms();
  const form = forms?.find(f => String(f.id) === String(id)) || {};

  // Basic KPIs derived from mock data (can wire to real data later)
  const kpis = useMemo(() => ([
    { title: 'Total Reviews', value: latestReviews.length },
    { title: 'Average Rating', value: '4.5' },
    { title: 'Response Rate', value: '92%' },
    { title: 'Last Updated', value: new Date().toLocaleDateString() },
  ]), [])

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
                to={`/share/${form.id}`}
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
                <div className="h2" style={{ marginTop: 0, marginBottom: 12, fontSize: 20, fontWeight: 700 }}>Edit Form</div>
                <div className="col">
                  <label className="label">Change form prompt</label>
                  <input className="input" placeholder="New prompt.." />
                  <label className="label">Change description</label>
                  <input className="input" placeholder="New description..." />
                  <button className="btn" style={{ alignSelf: 'flex-start' }}>Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}