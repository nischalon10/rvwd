export default function RatingBubble({ value }){
  return <div className="rating" aria-label={`score ${value}`}>{value}</div>
}
