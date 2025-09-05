import { useEffect, useMemo, useState } from 'react';
import FormCard from '../components/FormCard';
import CreateFormModal from '../components/CreateFormModal';
import FilterButton from '../components/FilterButton';
import styles from './Dashboard.module.css';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterMode, setFilterMode] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const userId = (user && user.userId) || localStorage.getItem('userId');

  // Motion preferences
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/forms?ownerId=${userId}`)
      .then(res => res.json())
      .then(data => setForms(data))
      .catch(() => setForms([]))
      .finally(() => setLoading(false));
  }, [showModal, userId]); // refetch when modal closes (new form added)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduceMotion(mql.matches);
      const onChange = (e) => setReduceMotion(e.matches);
      mql.addEventListener?.('change', onChange);
      mql.addListener?.(onChange);
      return () => {
        mql.removeEventListener?.('change', onChange);
        mql.removeListener?.(onChange);
      };
    }
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return forms;
    return forms.filter(f =>
      (f.title && f.title.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q))
    );
  }, [forms, query]);

  const displayedForms = useMemo(() => {
    let list = filtered;
    if (filterMode === 1) {
      list = [...filtered].sort((a, b) => b.score - a.score);
    } else if (filterMode === 2) {
      list = [...filtered].sort((a, b) => a.score - b.score);
    }
    return list;
  }, [filtered, filterMode]);

  const averageScore = useMemo(() => {
    if (!forms.length) return '-';
    const avg = forms.reduce((sum, f) => sum + (Number(f.score) || 0), 0) / forms.length;
    return avg.toFixed(1);
  }, [forms]);

  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const transitionBase = reduceMotion ? 'none' : `transform 600ms ${EASE}, opacity 600ms ${EASE}`;

  function handleFilterClick() {
    setFilterMode(mode => (mode + 1) % 3);
  }

  return (
    <div className={styles['dashboard-bg']}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className={styles.glass}
          style={{
            padding: 20,
            margin: '12px 0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            transform: mounted || reduceMotion ? 'none' : 'translateY(8px)',
            opacity: mounted || reduceMotion ? 1 : 0,
            transition: transitionBase,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 className={styles['dashboard-title']}>Dashboard</h1>
            <div className={styles.subtle} style={{ fontSize: 14 }}>
              {forms.length} total forms • Avg score {averageScore}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <FilterButton onClick={handleFilterClick} />
            <button className={styles['create-btn']} onClick={() => setShowModal(true)}>
              +
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign: 'center' }}>Loading...</div>
        ) : displayedForms.length > 0 ? (
          <div
            className="grid-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 32, 
              padding: 32, 
              alignItems: 'stretch',
              boxSizing: 'border-box'
            }}
          >
            {displayedForms.map((f, idx) => (
              <div
                key={f.id}
                className="dashboard-square"
                style={{
                  transform: mounted || reduceMotion ? 'none' : 'translateY(10px)',
                  opacity: mounted || reduceMotion ? 1 : 0,
                  transition: reduceMotion ? 'none' : `transform 600ms ${EASE}, opacity 600ms ${EASE}`,
                  transitionDelay: reduceMotion ? '0ms' : `${40 + idx * 30}ms`,
                }}
              >
                <FormCard form={f} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={styles.glass}
            style={{
              padding: 32,
              marginTop: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#e2e8f0',
              transform: mounted || reduceMotion ? 'none' : 'translateY(8px)',
              opacity: mounted || reduceMotion ? 1 : 0,
              transition: transitionBase,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No results</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>Try adjusting your search or create a new form.</div>
            <button className={styles['create-btn']} onClick={() => setShowModal(true)}>Create New Form</button>
          </div>
        )}

        {showModal && <CreateFormModal onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
}