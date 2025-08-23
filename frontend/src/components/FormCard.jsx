import { Link } from 'react-router-dom'
import { useForms } from '../context/FormsContext'

function Donut({ value }) {
  const radius = 28;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = Math.max(0, Math.min(1, value / 10));
  const strokeDashoffset = circumference * (1 - percent);
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
        stroke="#2ecc40"
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        style={{transition: 'stroke-dashoffset 0.5s'}}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="16"
        fontWeight="bold"
        fill="#222"
      >{value}</text>
    </svg>
  );
}

export default function FormCard({ form }){
  const { forms, setForms } = useForms();
  function handleDelete() {
    setForms(forms.filter(f => f.id !== form.id));
  }
  return (
    <div className="card" style={{display:'flex',alignItems:'center',gap:16,position:'relative'}}>
      <button
        onClick={handleDelete}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 28,
          height: 28,
          border: 'none',
          borderRadius: '50%',
          background: '#eee',
          color: '#c00',
          fontWeight: 'bold',
          fontSize: 18,
          cursor: 'pointer',
          zIndex: 2
        }}
        title="Delete"
        aria-label="Delete form"
      >-</button>
      <Donut value={form.score} />
      <div style={{flex:1}}>
        <div className="h3" style={{marginTop:0}}>
          <Link to={`/forms/${form.id}`}>{form.title}</Link>
        </div>
        <p style={{maxWidth:560, marginBottom:8}}>{form.snippet}</p>
        <Link to={`/forms/${form.id}`} className="btn small secondary">Click for more insights..</Link>
      </div>
    </div>
  )
}
