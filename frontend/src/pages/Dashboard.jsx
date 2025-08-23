import FormCard from '../components/FormCard';
import { useForms } from '../context/FormsContext';
export default function Dashboard() {
  const { forms } = useForms();
  return (
    <div className="container">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <div className="h1" style={{margin:0}}>Dashboard</div>
        <a href="/create" className="btn" style={{ background: '#111', color: '#fff', border: 'none' }}>Create New Form</a>
      </div>
      <div className="card-list">
        {forms.map(f => (
          <div key={f.id} style={{position:'relative'}}>
            <FormCard form={f} />
          </div>
        ))}
      </div>
    </div>
  );
}

