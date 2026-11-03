import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1518',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with numBottles and numExchange (JSON)',
  url: 'https://leetcode.com/problems/water-bottles/',
  complexity: 'Each round removes at least one bottle from the empty count, so the simulation runs in O(numBottles) time with O(1) extra space.',
  examples: [
    { label: 'Sample A', input: '{"numBottles":9,"numExchange":3}' },
    { label: 'Larger trade', input: '{"numBottles":15,"numExchange":4}' },
    { label: 'Smallest trade', input: '{"numBottles":1,"numExchange":2}' },
  ],
}

function Tile({ label, value }) {
  return <div style={{ minWidth: 96, padding: '8px 10px', border: '1px solid var(--border)', boxSizing: 'border-box' }}>
    <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
    <div style={{ fontFamily: 'monospace', fontSize: 20 }}>{value}</div>
  </div>
}

export default function WaterBottles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { round, drunk, empty, fresh, numExchange } = step.snapshot
    return <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Tile label="Round" value={round} />
        <Tile label="Drunk so far" value={drunk} />
        <Tile label="Empty bottles" value={empty} />
        <Tile label={`Received (${numExchange} empties each)`} value={fresh} />
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Recycle the empties:</strong> every exchange returns one full bottle, and that bottle becomes one more empty after it is drunk.</p>
    <p><strong>Keep the remainder:</strong> empties that cannot be traded stay in the count, so the next round starts from empty % numExchange plus the new bottles.</p>
  </>} />
}
