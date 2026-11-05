// Two lists of distinct values with the shared ones in the middle. Only-in-one values are highlighted on their side.
export default function VennView({ run, step }) {
  const { nums1, nums2 } = run.input
  const set1 = step.set1 ?? [...new Set(nums1)]
  const set2 = step.set2 ?? [...new Set(nums2)]
  const shared = set1.filter(x => set2.includes(x))
  const only1 = step.only1 ?? []
  const only2 = step.only2 ?? []
  const chip = (v, cls) => <span key={`${cls}-${v}`} className={`venn-chip ${cls}`}>{v}</span>
  return (
    <div className="venn-view">
      <div className="venn-columns">
        <div className="venn-side"><h4>nums1 only</h4>{only1.map(v => chip(v, 'is-only'))}{step.phase === 'sets' && <em>…</em>}</div>
        <div className="venn-side is-shared"><h4>in both</h4>{shared.map(v => chip(v, 'is-shared'))}</div>
        <div className="venn-side"><h4>nums2 only</h4>{only2.map(v => chip(v, 'is-only'))}{step.phase === 'sets' && <em>…</em>}</div>
      </div>
      <p>nums1 distinct: {set1.join(', ')}. nums2 distinct: {set2.join(', ')}.</p>
      <p>{step.message}</p>
    </div>
  )
}
