import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON)',
  complexity: 'O(1) time for the closed form. The trace groups the middle seats into one step.',
  examples: [
    { label: 'Many passengers', input: '{"n":72}' },
    { label: 'One passenger', input: '{"n":1}' },
    { label: 'Two passengers', input: '{"n":2}' },
    { label: 'Large count', input: '{"n":9999}' },
    { label: 'Three passengers', input: '{\"n\":3}' },
    { label: 'Long run: 100000 passengers', input: '{\"n\":100000}' },
  ],
}

const formatShare = value => (value === null ? '...' : value.toFixed(6))

// Seats are drawn in full for small planes; larger planes show the first seats, an ellipsis and the last seat.
function seatsToDraw(n) {
  if (n <= 10) return Array.from({ length: n }, (_, i) => i + 1)
  return [1, 2, 3, null, n]
}

export default function AirplaneSeatProbability() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { n, seat1, middle, seatN, running } = step.snapshot
    const rows = [['Seat 1', seat1], ['Middle seats', middle], ['Seat n', seatN]]
    return <div style={{ display: 'grid', gap: 10 }}>
      <div aria-label="Seats" role="img" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {seatsToDraw(n).map((seat, i) => seat === null
          ? <span key={`gap${i}`} style={{ padding: '4px 6px', color: 'var(--text-dim)' }}>…</span>
          : <span key={seat} data-seat={seat} style={{
            width: 44, padding: '4px 0', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
            border: seat === 1 || seat === n ? '2px solid var(--text)' : '1px solid var(--border)',
            background: seat === 1 ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--surface2)',
            color: 'var(--text)',
          }}>
            <div>{seat}</div>
            <small style={{ color: 'var(--text-dim)' }}>{seat === 1 ? 'first' : seat === n ? 'last' : 'middle'}</small>
          </span>)}
      </div>
      <div style={{ display: 'grid', gap: 6, fontFamily: 'monospace', color: 'var(--text)' }}>
        <div>Passengers: {n}</div>
        {rows.map(([label, value]) => <div key={label}>{label}: {formatShare(value)}</div>)}
        <output aria-label="Running probability">{`Running total: ${formatShare(running)}`}</output>
      </div>
    </div>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
