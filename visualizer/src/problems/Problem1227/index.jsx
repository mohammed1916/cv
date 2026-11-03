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
  ],
}

const formatShare = value => (value === null ? '...' : value.toFixed(6))

export default function AirplaneSeatProbability() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { n, seat1, middle, seatN, running } = step.snapshot
    const rows = [['Seat 1', seat1], ['Middle seats', middle], ['Seat n', seatN]]
    return <div aria-label="Contributions" style={{ display: 'grid', gap: 6, fontFamily: 'monospace' }}>
      <div>Passengers: {n}</div>
      {rows.map(([label, value]) => <div key={label}>{label}: {formatShare(value)}</div>)}
      <output aria-label="Running probability">{`Running total: ${formatShare(running)}`}</output>
    </div>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
