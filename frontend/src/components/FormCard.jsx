import { Link, useNavigate } from 'react-router-dom'
import { useForms } from '../context/FormsContext'

function getScoreColor(value) {
  // 0 = dark red, 5 = yellow, 10 = dark green
  if (value <= 5) {
    // Red to yellow
    const r = 200;
    const g = Math.round(40 + (value / 5) * 160); // 40 to 200
    return `rgb(${r},${g},40)`;
  } else {
    // Yellow to green
    const r = Math.round(200 - ((value - 5) / 5) * 120); // 200 to 80
    const g = Math.round(200 - ((10 - value) / 5) * 120); // 200 to 320 (clamped at 200)
    return `rgb(${r},${Math.min(g,200)},40)`;
  }
}

function Donut({ value }) {
  const radius = 28 * 1.4; // 40% bigger
  const stroke = 6 * 1.4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = Math.max(0, Math.min(1, value / 10));
  const strokeDashoffset = circumference * (1 - percent);
  const color = getScoreColor(value);
  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#eee"
        fill="none"
        strokeWidth={stroke}
        cx={radius}
        cy={radius}
        r={normalizedRadius}
      />
      <circle
        stroke={color}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        style={{transition: 'stroke-dashoffset 0.5s, stroke 0.5s'}}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="22"
        fontWeight="bold"
        fill="#222"
      >{value}</text>
    </svg>
  );
}

export default function FormCard({ form }){
  const { forms, setForms } = useForms();
  const navigate = useNavigate();
  function handleDelete() {
    setForms(forms.filter(f => f.id !== form.id));
  }
  function handleShare(e) {
    e.stopPropagation();
    navigate(`/share/${form.id}`);
  }
  return (
  <Link to={`/forms/${form.id}`} className="card" style={{display:'flex',flexDirection:'column',alignItems:'stretch',gap:12,position:'relative',height:'100%', textDecoration:'none', color:'inherit', cursor:'pointer'}}>
      <Link
        to={`/share/${form.id}`}
        state={{ question: form.question }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          padding: '4px 12px',
          border: 'none',
          borderRadius: '16px',
          background: '#1976d2',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 13,
          cursor: 'pointer',
          zIndex: 2,
          textDecoration: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
        }}
        title="Record"
        aria-label="Record form"
      >Record</Link>
      <div className="h3" style={{
        marginTop: 0,
        marginBottom: 8,
        textAlign: 'left',
        paddingRight: 0,
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        maxHeight: '2.6em',
        lineHeight: '1.3',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {form.title}
      </div>
      <div style={{display:'flex', flexDirection:'row', alignItems:'stretch', gap:16, marginBottom:8, flex:1}}>
        <div style={{flexShrink:0, display:'flex', alignItems:'center'}}>
          <Donut value={form.score} />
        </div>
        <div style={{flex:1, maxWidth:'100%', overflow:'auto', display:'flex', alignItems:'center'}}>
          <p style={{margin:0}}>{form.snippet}</p>
        </div>
      </div>
      {/* Bottom row with Date Created and Share button */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', flexShrink: 0, marginTop: 8}}>
        <div style={{fontSize:13, color:'#666', textAlign:'left', marginRight: 16}}>
          <span>{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}</span>
        </div>
        <button
          onClick={handleShare}
          style={{
            padding: '6px 18px',
            border: 'none',
            borderRadius: '16px',
            background: '#1976d2',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 13,
            cursor: 'pointer',
            zIndex: 2,
            textDecoration: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
          }}
          title="Share"
          aria-label="Share this form"
        >
          Share
        </button>
      </div>
    </Link>
  );
}