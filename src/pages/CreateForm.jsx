export default function CreateForm(){
  return (
    <div className="container">
      <div className="h1">Create New</div>

      <div className="card" style={{maxWidth:520}}>
        <div className="col">
          <label className="label">Name</label>
          <input className="input" placeholder="Value" />

          <label className="label">Category/Type</label>
          <input className="input" placeholder="Value" />

          <label className="label">Description</label>
          <input className="input" placeholder="Value" />

          <label className="label">Date Created</label>
          <textarea className="input" placeholder="Value"></textarea>

          <label className="label">Status</label>
          <input className="input" placeholder="Value" />

          <label className="label">Responses</label>
          <input className="input" placeholder="Value" />

          <label className="label">Owner</label>
          <input className="input" placeholder="Value" />

          <button className="btn">Submit</button>
        </div>
      </div>
    </div>
  )
}
