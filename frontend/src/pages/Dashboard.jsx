import FormCard from '../components/FormCard';
import { useForms } from '../context/FormsContext';
import { useState } from 'react';
import CreateFormModal from '../components/CreateFormModal';
import FilterButton from '../components/FilterButton';
export default function Dashboard() {
  const { forms } = useForms();
  const [showModal, setShowModal] = useState(false);
  // filterMode: 0 = default, 1 = descending, 2 = ascending
  const [filterMode, setFilterMode] = useState(0);

  let displayedForms = forms;
  if (filterMode === 1) {
    displayedForms = [...forms].sort((a, b) => b.score - a.score);
  } else if (filterMode === 2) {
    displayedForms = [...forms].sort((a, b) => a.score - b.score);
  }

  function handleFilterClick() {
    setFilterMode(mode => (mode + 1) % 3);
  }

  return (
    <div className="container">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <div className="h1" style={{margin:0}}>Dashboard</div>
        <div style={{display:'flex',alignItems:'center',position:'relative'}}>
          <button className="btn" style={{ background: '#111', color: '#fff', border: 'none' }} onClick={()=>setShowModal(true)}>Create New Form</button>
          <FilterButton onClick={handleFilterClick} active={filterMode !== 0} />
        </div>
      </div>
      <div className="grid-3">
        {displayedForms.map(f => (
          <div key={f.id} className="dashboard-square">
            <FormCard form={f} />
          </div>
        ))}
      </div>
      {showModal && <CreateFormModal onClose={()=>setShowModal(false)} />}
    </div>
  );
}

