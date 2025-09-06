import { useEffect, useMemo, useState } from 'react';
import FormCard from '../components/FormCard';
import CreateFormModal from '../components/CreateFormModal';
import styles from './Dashboard.module.css';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterMode, setFilterMode] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

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
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.02) 0%, transparent 50%)
          `,
          animation: reduceMotion ? 'none' : 'gentlePulse 8s ease-in-out infinite alternate',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header Section */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px 36px',
            margin: '24px 0 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(229, 231, 235, 0.6)',
            transform: mounted || reduceMotion ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)',
            opacity: mounted || reduceMotion ? 1 : 0,
            transition: transitionBase,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h1 
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Dashboard
            </h1>
            <div 
              style={{ 
                fontSize: 16, 
                color: '#64748b',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span>{forms.length} total forms</span>
              <span>•</span>
              <span>Avg score {averageScore}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search forms..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                background: '#f8fafc',
                fontSize: '15px',
                fontWeight: 500,
                color: '#1f2937',
                outline: 'none',
                minWidth: '240px',
                transition: 'all 200ms ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            
            <button 
              style={{
                background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(100, 116, 139, 0.15)',
                transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: 'translateY(0)',
              }}
              onClick={handleFilterClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(100, 116, 139, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 116, 139, 0.15)';
              }}
              title={`Sort: ${filterMode === 0 ? 'Default' : filterMode === 1 ? 'High to Low Score' : 'Low to High Score'}`}
            >
              Sort
              {filterMode === 1 && <span style={{ fontSize: '12px' }}>↓</span>}
              {filterMode === 2 && <span style={{ fontSize: '12px' }}>↑</span>}
            </button>
            
            <button 
              style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 20px rgba(31, 41, 55, 0.15)',
                transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: 'translateY(0)',
              }}
              onClick={() => setShowModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(31, 41, 55, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(31, 41, 55, 0.15)';
              }}
            >
              <span style={{ fontSize: '18px' }}>+</span>
              Create New Form
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              fontSize: '18px',
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: reduceMotion ? 'none' : 'spin 1s linear infinite',
                }}
              />
              Loading your forms...
            </div>
          </div>
        ) : displayedForms.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 32,
              padding: '0 4px 48px',
            }}
          >
            {displayedForms.map((form, idx) => (
              <div
                key={form.id}
                style={{
                  transform: hoveredCard === form.id 
                    ? 'translateY(-8px) scale(1.02)' 
                    : mounted || reduceMotion ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                  opacity: mounted || reduceMotion ? 1 : 0,
                  transition: reduceMotion 
                    ? 'none' 
                    : `all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                  transitionDelay: reduceMotion ? '0ms' : `${60 + idx * 40}ms`,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredCard(form.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '28px 32px',
                    boxShadow: hoveredCard === form.id
                      ? '0 25px 50px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8)'
                      : '0 8px 25px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(229, 231, 235, 0.6)',
                    transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Hover glow effect */}
                  {hoveredCard === form.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #3b82f6, #10b981, #8b5cf6)',
                        borderRadius: '20px 20px 0 0',
                        animation: reduceMotion ? 'none' : 'shimmer 2s ease-in-out infinite',
                      }}
                    />
                  )}
                  
                  <FormCard form={form} />
                  
                  {/* Enhanced hover insights */}
                  {hoveredCard === form.id && (
                    <div
                      style={{
                        marginTop: '20px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        animation: reduceMotion ? 'none' : 'fadeInUp 300ms ease-out',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                        Quick Insights
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '13px', color: '#6b7280' }}>
                        <span>Score: {form.score || 'N/A'}</span>
                        <span>Responses: {form.responseCount || 0}</span>
                        <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '48px 32px',
              marginTop: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(229, 231, 235, 0.6)',
              transform: mounted || reduceMotion ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
              opacity: mounted || reduceMotion ? 1 : 0,
              transition: transitionBase,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>
              No forms found
            </div>
            <div style={{ fontSize: 16, color: '#64748b', marginBottom: 24, maxWidth: '400px' }}>
              {query ? 'Try adjusting your search terms or create a new form to get started.' : 'Create your first form to start collecting valuable feedback from students and colleagues.'}
            </div>
            <button 
              style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 20px rgba(31, 41, 55, 0.15)',
                transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onClick={() => setShowModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(31, 41, 55, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(31, 41, 55, 0.15)';
              }}
            >
              <span style={{ fontSize: '20px' }}>+</span>
              Create Your First Form
            </button>
          </div>
        )}

        {showModal && <CreateFormModal onClose={() => setShowModal(false)} />}
      </div>

      <style jsx>{`
        @keyframes gentlePulse {
          0% { opacity: 0.5; }
          100% { opacity: 0.8; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          0% { 
            opacity: 0;
            transform: translateY(10px);
          }
          100% { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}