// Two rows show nums1 and nums2 by position. The middle value y is outlined; values that fit on its left and right are tinted.
export default function TripletView({ run, step }) {
  const { nums1, nums2 } = run.input
  const y = step.y ?? -1
  const left = new Set(step.leftSet ?? [])
  const right = new Set(step.rightSet ?? [])
  const row = (label, arr) => <div className="triplet-row">
    <span>{label}</span>
    {arr.map((v, i) => {
      const cls = v === y ? 'is-middle' : left.has(v) ? 'is-left' : right.has(v) ? 'is-right' : ''
      return <div key={i} className={`triplet-cell ${cls}`}><small>{i}</small><strong>{v}</strong></div>
    })}
  </div>
  return (
    <div className="triplet-view" role="img" aria-label={`nums1 ${nums1.join(', ')}; nums2 ${nums2.join(', ')}`}>
      {row('nums1', nums1)}
      {row('nums2', nums2)}
      <p>Middle value y = <strong>{y >= 0 ? y : '-'}</strong>. Left (earlier in both): {(step.leftSet ?? []).join(', ') || 'none'}. Right (later in both): {(step.rightSet ?? []).join(', ') || 'none'}.</p>
      <p>Triplets counted so far: <strong>{step.total}</strong></p>
    </div>
  )
}
