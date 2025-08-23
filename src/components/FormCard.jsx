import { Link } from 'react-router-dom'

export default function FormCard({ form }){
  return (
    <div className="card" style={{display:'flex',alignItems:'center',gap:16}}>
      <div className="img-placeholder">image</div>
      <div style={{flex:1}}>
        <div className="h3" style={{marginTop:0}}>
          <Link to={`/forms/${form.id}`}>{form.title}</Link>
        </div>
        <p style={{maxWidth:560, marginBottom:8}}>{form.snippet}</p>
        <Link to={`/forms/${form.id}`} className="btn small secondary">Click for more insights..</Link>
      </div>
      <div style={{marginLeft:'auto'}}>
        <div className="helper" style={{textAlign:'right',marginBottom:6}}>—</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:84}}></div>
        </div>
      </div>
    </div>
  )
}
