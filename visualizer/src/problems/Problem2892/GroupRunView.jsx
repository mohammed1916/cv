import './GroupRunView.css'

const PALETTE = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#dc2626']

export default function GroupRunView({ run, step }) {
  const { nums, k } = run.input
  const starts = step.starts || []
  const groupOf = i => {
    let g = -1
    starts.forEach((s, idx) => { if (s <= i) g = idx })
    return g
  }
  const productPct = step.candidate ?? step.product
  const gauge = Math.min(100, (productPct / k) * 100)
  const over = productPct > k
  return (
    <figure className="group-run" aria-label="Greedy grouping of nums">
      <div className="group-run__cells" role="list">
        {nums.map((v, i) => {
          const g = groupOf(i)
          const processed = i <= step.index || (step.index === -1 && step.phase === 'done')
          const color = g >= 0 ? PALETTE[g % PALETTE.length] : 'transparent'
          const current = i === step.index
          return (
            <div role="listitem" key={i}
              className={`group-run__cell${current ? ' is-current' : ''}${processed ? '' : ' is-pending'}`}
              style={{ '--group': color }}>
              <span className="group-run__pointer">{current ? (step.phase === 'merge' ? 'joins' : step.phase === 'split' ? 'starts' : 'x') : ''}</span>
              <span className="group-run__value">{v}</span>
              <span className="group-run__index">{i}</span>
            </div>
          )
        })}
      </div>
      <div className="group-run__bands" aria-hidden="true">
        {starts.map((s, g) => {
          const end = g + 1 < starts.length ? starts[g + 1] - 1 : (step.index >= 0 ? Math.max(step.index, s) : nums.length - 1)
          const span = Math.max(0, end - s + 1)
          return (
            <div key={g} className="group-run__band" style={{ '--group': PALETTE[g % PALETTE.length], left: `${(s / nums.length) * 100}%`, width: `${(span / nums.length) * 100}%` }}>
              G{g + 1}
            </div>
          )
        })}
      </div>
      <div className="group-run__gauge" aria-label={`Product ${productPct} against limit ${k}`}>
        <div className="group-run__gauge-label">
          <span>{step.candidate !== null && step.candidate !== undefined ? `candidate ${step.candidate}` : `product ${step.product}`}</span>
          <span>limit k = {k}</span>
        </div>
        <div className="group-run__track">
          <div className={`group-run__fill${over ? ' is-over' : ''}`} style={{ width: `${gauge}%` }} />
          <div className="group-run__limit" style={{ left: '100%' }} />
        </div>
        <p className="group-run__verdict">
          {step.phase === 'consider' && step.candidate !== null ? (over ? 'Above k: new group' : 'At most k: join') : step.phase === 'done' ? `Groups = ${step.groups}` : `Groups so far: ${step.groups}`}
        </p>
      </div>
    </figure>
  )
}
