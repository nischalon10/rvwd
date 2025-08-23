import React from 'react';

export default function FilterButton({ onClick }) {
  return (
    <button
      className="btn"
  style={{ background: '#111', color: '#fff', border: 'none', marginLeft: 12, fontWeight: 700 }}
      onClick={onClick}
      title="Filter by score"
    >
      Filter
    </button>
  );
}
