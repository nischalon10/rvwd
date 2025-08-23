import Accordion from '../components/Accordion'
import { latestReviews, sampleSummary } from '../mockData'

export default function FormDetail(){
  return (
    <div>
      <div style={{background:'#f6f6f7', borderBottom:'1px solid #eee'}}>
        <div className="container">
          <div className="h2" style={{marginTop:0}}>Latest reviews</div>
          <div className="grid-3">
            {latestReviews.map(card => (
              <div className="card" key={card.id} style={{height:140}}>
                <div className="helper">☆☆☆☆☆</div>
                <div className="h3">{card.title}</div>
                <div className="helper">{card.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:24}}>
        <div className="col" style={{marginTop:12}}>
          <Accordion title="Summary" defaultOpen>
            <div className="form-row">
              <textarea className="input" style={{minHeight:100}} defaultValue={sampleSummary}></textarea>
            </div>
          </Accordion>

          <Accordion title="View all responses">
            <div className="helper">This is a placeholder table for responses.</div>
            <div className="card" style={{padding:0, overflow:'hidden'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#fafafa'}}>
                    <th style={{textAlign:'left', padding:10, borderBottom:'1px solid #eee'}}>User</th>
                    <th style={{textAlign:'left', padding:10, borderBottom:'1px solid #eee'}}>Rating</th>
                    <th style={{textAlign:'left', padding:10, borderBottom:'1px solid #eee'}}>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{padding:10, borderBottom:'1px solid #f0f0f0'}}>Guest 1</td>
                    <td style={{padding:10, borderBottom:'1px solid #f0f0f0'}}>4</td>
                    <td style={{padding:10, borderBottom:'1px solid #f0f0f0'}}>Loved the food, a bit salty.</td>
                  </tr>
                  <tr>
                    <td style={{padding:10}}>Guest 2</td>
                    <td style={{padding:10}}>5</td>
                    <td style={{padding:10}}>Great experience all around.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Accordion>

          <Accordion title="Data Analysis and Scorings">
            <p className="helper">Place your analytics, charts or insights here.</p>
          </Accordion>

          <Accordion title="Filter by Date and Time">
            <div className="row">
              <div className="col" style={{flex:1}}>
                <label className="label">From</label>
                <input type="date" className="input" />
              </div>
              <div className="col" style={{flex:1}}>
                <label className="label">To</label>
                <input type="date" className="input" />
              </div>
            </div>
          </Accordion>

          <Accordion title="Search by Keyword">
            <input className="input" placeholder="Type keyword..." />
          </Accordion>
        </div>

        <div className="col" style={{marginTop:12}}>
          <div className="card">
            <div className="col">
              <label className="label">Change form prompt</label>
              <input className="input" placeholder="New prompt.." />
              <label className="label">Change description</label>
              <input className="input" placeholder="New description..." />
              <button className="btn">Submit</button>
            </div>
            <div style={{height:16}}></div>
            <div className="col" style={{alignItems:'center', gap:6}}>
              <input id="toggle" type="checkbox" className="toggle" />
              <div className="helper">Turn off Responses</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
