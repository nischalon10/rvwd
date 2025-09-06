import React, { useEffect, useState } from 'react';

export default function SimpleCopyPopout({ text = 'abem', onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: '94%',
          background: '#fff',
          borderRadius: 10,
          padding: 18,
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Copy from Clipboard</div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ fontSize: 13, color: '#444' }}>
          Click copy to copy the text below to your clipboard.
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            readOnly
            value={text}
            onFocus={e => e.target.select()}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e6e6e6',
              fontSize: 14,
              background: '#f7f7fb'
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: copied ? '#2a9d8f' : '#1976d2',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

      </div>
    </div>
  );
}