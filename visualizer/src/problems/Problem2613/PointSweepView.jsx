import './PointSweepView.css'

const SIZE = 300
const PAD = 28
const RANGE = 10

export default function PointSweepView({ run, step }) {
  const { nums1, nums2 } = run.input
  const lo = -RANGE
  const hi = RANGE
  const scale = v => PAD + ((v - lo) / (hi - lo)) * (SIZE - 2 * PAD)
  const sx = scale
  const sy = v => SIZE - scale(v)
  const j = step.j
  const inserted = new Set(step.inserted ?? [])
  const bestPair = step.bestPair
  const jx = j >= 0 ? nums1[j] : null
  const jy = j >= 0 ? nums2[j] : null
  const regionOf = step.region
  const pts = nums1.map((x, i) => ({ i, x, y: nums2[i] }))
  return (
    <div className="ps-view">
      <p className="ps-rule">
        Each index is a point (nums1[i], nums2[i]). Distance is |x - x'| + |y - y'|. Points are swept left to right.
      </p>
      <svg className="ps-plot" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Points sweep; current point ${j >= 0 ? j : 'none'}`}>
        <line x1={PAD} y1={sy(0)} x2={SIZE - PAD} y2={sy(0)} className="ps-axis" />
        <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={SIZE - PAD} className="ps-axis" />
        {j >= 0 && regionOf !== 'B' && <rect className="ps-region ps-region--a" x={PAD} y={sy(jy)} width={sx(jx) - PAD} height={sy(lo) - sy(jy)} />}
        {j >= 0 && regionOf !== 'A' && <rect className="ps-region ps-region--b" x={PAD} y={sy(hi)} width={sx(jx) - PAD} height={sy(jy) - sy(hi)} />}
        {bestPair && <line className="ps-best" x1={sx(nums1[bestPair[0]])} y1={sy(nums2[bestPair[0]])} x2={sx(nums1[bestPair[1]])} y2={sy(nums2[bestPair[1]])} />}
        {pts.map(p => {
          const role = p.i === j ? 'now' : p.i === step.partner ? 'partner' : inserted.has(p.i) ? 'seen' : 'ahead'
          return (
            <g key={p.i} className={`ps-point ps-point--${role}`} data-role={role}>
              <circle cx={sx(p.x)} cy={sy(p.y)} r={8} />
              <text x={sx(p.x)} y={sy(p.y) + 3}>{p.i}</text>
            </g>
          )
        })}
      </svg>
      <p className="ps-note">
        {j >= 0 ? `Point ${j} at (${jx}, ${jy}).` : 'Set-up.'}
        {step.partner !== null && step.partner !== undefined ? ` Partner found: ${step.partner}.` : ''}
      </p>
      <output className="ps-best-text" aria-label="Best pair so far">
        {bestPair ? `Best so far: pair [${bestPair[0]}, ${bestPair[1]}], distance ${step.bestDist}` : 'No pair yet'}
      </output>
    </div>
  )
}
