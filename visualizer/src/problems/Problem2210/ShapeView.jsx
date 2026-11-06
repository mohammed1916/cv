import IndexedSequence from '../../components/shared/IndexedSequence'
// The array as a bar chart. The middle of the triple being compared is outlined; its neighbours are the nearest different values.
export default function ShapeView({ run, step }) {
  const { nums } = run.input
  const max = Math.max(1, ...nums)
  const [l, m, r] = step.triple ?? []
  const shown = step.compact ?? nums
  const midAt = step.midAt ?? -1
  let leftAt = -1, rightAt = -1
  if (midAt >= 0) {
    for (let j = midAt - 1; j >= 0; j--) if (nums[j] !== nums[midAt]) { leftAt = j; break }
    for (let j = midAt + 1; j < nums.length; j++) if (nums[j] !== nums[midAt]) { rightAt = j; break }
  }
  return (
    <div className="shape-view">
      <div className="shape-bars" role="img" aria-label={`Values ${nums.join(', ')}`}>
        {nums.map((v, i) => <div key={i} className="shape-col">
          <div className={`shape-bar${step.midAt === i ? ' is-mid' : ''}`} style={{ height: `${(v / max) * 130 + 6}px` }}><span>{v}</span></div>
          <small>{i}</small>
        </div>)}
      </div>
      <IndexedSequence label="nums (input array): left, mid and right neighbours" length={nums.length} valueAt={i => nums[i]} roleAt={i => (i === leftAt ? 'left' : i === midAt ? 'mid' : i === rightAt ? 'right' : '')} />
      <p>Compressed: {shown.join(', ')}.</p>
      {step.triple && <p>Neighbours {l} and {r} around {m}: {step.hill ? 'hill' : step.valley ? 'valley' : 'neither'}.</p>}
      <p>Count so far: <strong>{step.count}</strong></p>
    </div>
  )
}
