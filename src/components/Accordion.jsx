import { useState } from 'react'

export default function Accordion({ title, children, defaultOpen=false }){
  const [open,setOpen] = useState(defaultOpen)
  return (
    <div className="accordion">
      <div className="ac-header" onClick={()=>setOpen(!open)}>
        <div className="h3" style={{margin:0}}>{title}</div>
        <div aria-hidden> {open ? '▾' : '▸'} </div>
      </div>
      {open && <div className="ac-content">{children}</div>}
    </div>
  )
}
