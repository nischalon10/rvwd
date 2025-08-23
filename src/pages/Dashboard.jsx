import FormCard from '../components/FormCard'
import RatingBubble from '../components/RatingBubble'
import { forms } from '../mockData'

export default function Dashboard(){
  return (
    <div className="container">
      <div className="h1">All forms made by you..</div>
      <div className="card-list">
        {forms.map(f => (
          <div key={f.id} style={{position:'relative'}}>
            <FormCard form={f} />
            <div style={{position:'absolute', right:16, top:16}}>
              <RatingBubble value={f.score} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
