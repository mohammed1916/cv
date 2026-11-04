import IndexedSequence from '../../components/shared/IndexedSequence'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { abbreviate } from './algorithm'

const CELL = {
  0: { background: 'var(--surface3)', border: '2px solid var(--success)', label: 'equal' },
  1: { background: 'var(--surface2)', border: '2px solid var(--primary)', label: 'one operation' },
  2: { background: 'transparent', border: '2px dashed var(--warning)', label: 'two operations' },
}
const cellBase = { width: 40, height: 30, textAlign: 'center', borderRadius: 4, color: 'var(--text)', fontSize: 13 }

// One row per target, one column per value. Filling a row prices that target against every element.
function CostMatrix({ step }) {
  const { distinct, freq, rows, activeRow, best, targetLabel, target } = step
  return <div style={{ overflowX: 'auto' }}>
    <table aria-label="Cost of each element for each target" style={{ borderCollapse: 'separate', borderSpacing: 3, color: 'var(--text)' }}>
      <caption style={{ textAlign: 'left', fontWeight: 600, padding: '4px 0' }}>Operations for one copy of each value to reach the target</caption>
      <thead>
        <tr>
          <th scope="col" style={{ fontSize: 12, textAlign: 'left' }}>target ↓ / value →</th>
          {distinct.map((x, i) => <th scope="col" key={x} style={{ fontSize: 12 }}>{abbreviate(x)}<br /><small style={{ fontWeight: 400 }}>×{freq[i]}</small></th>)}
          <th scope="col" style={{ fontSize: 12 }}>total ops</th>
        </tr>
      </thead>
      <tbody>
        <tr data-row="multiple" style={targetLabel === 'common multiple' ? { fontWeight: 700 } : undefined}>
          <th scope="row" style={{ fontSize: 12, textAlign: 'left' }}>common multiple</th>
          {distinct.map(x => {
            const zero = String(x) === step.commonMultiple
            return <td key={x} style={{ ...cellBase, ...CELL[zero ? 0 : 1] }}>{zero ? 0 : 1}</td>
          })}
          <td style={{ ...cellBase, width: 60 }}>{step.phase === 'count' || step.phase === 'tally' ? '' : step.multipleTotal}</td>
        </tr>
        {rows.map((row, r) => {
          const isActive = r === activeRow
          const isBest = targetLabel === 'value in nums' && String(row.v) === target
          return <tr key={row.v} data-row={row.v} data-active={isActive} style={{ outline: isActive ? '2px solid var(--primary)' : 'none', fontWeight: isBest ? 700 : 400 }}>
            <th scope="row" style={{ fontSize: 12, textAlign: 'left' }}>{abbreviate(row.v)}{isBest ? ' (best)' : ''}</th>
            {row.excluded
              ? <td colSpan={distinct.length} style={{ ...cellBase, width: 'auto', fontSize: 12 }}>unreachable: nothing divides down to 1</td>
              : row.costs.map((cost, i) => <td key={i} style={{ ...cellBase, ...CELL[cost] }} title={CELL[cost].label}>{cost}</td>)}
            <td style={{ ...cellBase, width: 60 }}>{row.excluded ? '—' : row.total}</td>
          </tr>
        })}
      </tbody>
    </table>
    <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {[0, 1, 2].map(k => <span key={k}><span style={{ display: 'inline-block', padding: '0 6px', marginRight: 4, borderRadius: 3, background: CELL[k].background, border: CELL[k].border }}>{k}</span>{CELL[k].label}</span>)}
      <span>Total counts duplicates. Best so far: <strong>{best}</strong></span>
    </p>
  </div>
}

function Divisors({ step }) {
  if (step.currentX === null) return null
  const hits = new Set(step.hits)
  return <div aria-label={`Divisors of ${step.currentX}`} style={{ color: 'var(--text)' }}>
    <strong style={{ fontSize: 13 }}>Divisors of {abbreviate(step.currentX)}</strong>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
      {step.divisors.map(d => <span key={d} data-divisor={d} data-hit={hits.has(d)} style={{
        padding: '2px 6px', borderRadius: 4, fontSize: 12, background: hits.has(d) ? 'var(--surface3)' : 'transparent',
        border: `${hits.has(d) ? 2 : 1}px solid ${hits.has(d) ? 'var(--primary)' : 'var(--border)'}`, fontWeight: hits.has(d) ? 700 : 400,
      }}>{d}</span>)}
      {step.divisorTotal > step.divisors.length && <span style={{ fontSize: 12 }}>and {step.divisorTotal - step.divisors.length} more</span>}
    </div>
  </div>
}

function PlanList({ step }) {
  if (!step.plan) return null
  return <ol aria-label="Operations per element" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3, color: 'var(--text)' }}>
    {step.plan.slice(0, step.planIndex + 1).map((ops, i) => <li key={i} style={{ fontSize: 13, padding: '2px 6px', borderLeft: `3px solid ${i === step.planIndex ? 'var(--primary)' : 'var(--border)'}` }}>
      [{i}] {ops.length === 0 ? 'no operation' : ops.map(o => `${abbreviate(o.from)} ${o.kind} ${abbreviate(o.k)} = ${abbreviate(o.to)}`).join(' → ')}
    </li>)}
  </ol>
}

export default function TargetCostView({ run, step }) {
  const { distinct } = step
  const indexOf = v => distinct.indexOf(v)
  const edges = []
  distinct.forEach((a, i) => distinct.forEach((b, j) => { if (i !== j && b % a === 0) edges.push([i, j]) }))
  const focusIndex = step.focus !== null ? indexOf(step.focus) : step.currentX !== null ? indexOf(step.currentX) : null
  const anchor = step.focus ?? step.currentX
  const near = anchor === null ? [] : distinct.map((x, i) => (x !== anchor && (x % anchor === 0 || anchor % x === 0) ? i : -1)).filter(i => i >= 0)
  const far = anchor === null ? [] : distinct.map((x, i) => (x !== anchor && !near.includes(i) ? i : -1)).filter(i => i >= 0)
  const tags = Object.fromEntries(step.freq.map((c, i) => [i, c > 1 ? `×${c}` : '']))
  return <section aria-label="Choosing a common target" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <IndexedSequence label={step.plan ? 'nums, moved to the target' : 'nums'} length={step.values.length} valueAt={i => abbreviate(step.values[i])}
      active={step.plan && step.planIndex < step.values.length ? step.planIndex : -1}
      roleAt={i => (step.plan && i <= step.planIndex && step.plan[i] ? `${step.plan[i].length} op${step.plan[i].length === 1 ? '' : 's'}` : '')} />
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 300px', minWidth: 0 }}>
        <GraphTraversalView title="An arrow means multiply along it, or divide against it" n={distinct.length} edges={edges} directed
          labels={distinct.map(abbreviate)} current={focusIndex} frontier={near} visited={far} tags={tags} showFrontier={false}
          legend={{ current: 'target or value in focus', neighbour: '', frontier: 'one operation away', visited: 'two operations away', done: '' }} />
      </div>
      <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Divisors step={step} />
        <CostMatrix step={step} />
        <PlanList step={step} />
      </div>
    </div>
    <RecordStateTable label="Tallies built from divisors" columns={['value', 'count', 'divides (above)', 'divided by (below)']} rows={step.tally}
      activeRow={distinct.indexOf(step.currentX ?? step.focus)} />
  </section>
}
