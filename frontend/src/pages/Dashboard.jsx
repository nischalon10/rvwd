import FormCard from '../components/FormCard';
import { useForms } from '../context/FormsContext';
import { useState } from 'react';
import CreateFormModal from '../components/CreateFormModal';
export default function Dashboard() {
  const { forms } = useForms();
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="container">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <div className="h1" style={{margin:0}}>Dashboard</div>
        <button className="btn" style={{ background: '#111', color: '#fff', border: 'none' }} onClick={()=>setShowModal(true)}>Create New Form</button>
      </div>
      <div className="card-list">
        {forms.map(f => (
          <div key={f.id} style={{position:'relative'}}>
            <FormCard form={f} />
          </div>
        ))}
      </div>
      {showModal && <CreateFormModal onClose={()=>setShowModal(false)} />}
    </div>
  );
}

