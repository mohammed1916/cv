import './JumpZigzagView.css'

// Blocks are drawn in height order. The two pointers show which blocks are still unvisited;
// the highlighted block is the one just jumped to, and the route line lists the landing heights.
export default function JumpZigzagView({ run, step }) {
  if (!run || !step) return <section className="jz-view"><p className="jz-empty">Press Play to zigzag between the tallest and shortest blocks.</p></section>
  const values = step.values
  const top = Math.max(1, ...values)
  const lo = step.lo
  const hi = step.hi
  const landed = step.route.slice(1)
  return (
    <section className="jz-view" aria-label="Jump zigzag over blocks">
      <div className="jz-stage">
        <div className="jz-ground"><span>ground 0</span></div>
        {values.map((value, index) => {
          const visited = index < lo || index > hi
          const classes = ['jz-block']
          if (visited) classes.push('jz-block--visited')
          if (index === lo && lo <= hi) classes.push('jz-block--lo')
          if (index === hi && lo <= hi) classes.push('jz-block--hi')
          return (
            <div key={index} className={classes.join(' ')} aria-label={`block ${value}${visited ? ' visited' : ''}`}>
              <div className="jz-column" style={{ height: `${Math.max(8, (value / top) * 100)}%` }} />
              <span className="jz-value">{value}</span>
            </div>
          )
        })}
      </div>
      <div className="jz-route" aria-label="Landing heights">
        <span className="jz-label">route</span>
        <span className="jz-chip jz-chip--ground">0</span>
        {landed.map((value, index) => <span key={index} className="jz-chip">{`→ ${value}`}</span>)}
      </div>
      <div className="jz-readout">
        <span>{step.picked ? `Jump from ${step.from} to the ${step.picked === 'hi' ? 'highest' : 'lowest'} block, earning ${step.earned}` : `Running total ${step.total}`}</span>
        <span className="jz-total">{`total ${step.total}`}</span>
      </div>
      <p className="jz-key">Blue: unvisited. Grey: visited. Amber: next highest. Violet: next lowest. Jumps earn the squared height difference.</p>
    </section>
  )
}
