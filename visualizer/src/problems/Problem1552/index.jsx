import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const cell = { minWidth: 36, textAlign: 'center', border: '1px solid var(--border)', padding: 4, fontFamily: 'monospace' }

const definition = {
  number: '1552',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with positions and m (JSON)',
  url: 'https://leetcode.com/problems/magnetic-force-between-two-balls/',
  complexity: 'O(n log n) for sorting and O(n log D) for the search over gaps D, with O(n) space.',
  examples: [
    { label: 'Five slots', input: '{"positions":[1,2,3,4,7],"m":3}' },
    { label: 'Two balls', input: '{"positions":[5,4,3,2,1,9],"m":2}' },
    { label: 'Tight', input: '{"positions":[1,4,9,10],"m":4}' },
  ],
}

export default function MagneticBalls() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { positions, lo, hi, mid, placed, ok } = step.snapshot
    const span = Math.max(1, positions[positions.length - 1] - positions[0])
    return <>
      <div aria-label="Positions" style={{ position: 'relative', height: 40, border: '1px solid var(--border)', margin: '8px 0' }}>
        {positions.map(p => <div key={p} title={`Position ${p}`} style={{ position: 'absolute', left: `${((p - positions[0]) / span) * 96}%`, top: 6, width: 12, height: 22, borderRadius: 6, background: placed?.includes(p) ? '#bbf7d0' : 'var(--surface2)' }} />)}
      </div>
      <p>Search range for the gap: <strong>{lo}</strong> to <strong>{hi}</strong>{mid !== null && mid !== undefined && <> · trying <strong>{mid}</strong></>}</p>
      {placed?.length > 0 && <p aria-label="Greedy placements">Greedy balls at: {placed.join(', ')}{ok !== undefined && (ok ? ' (enough)' : ' (too few)')}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> if a gap works, every smaller gap works too. So the answer can be found by binary search over the gap, with a greedy check for each candidate.</p>
    <p>The greedy check places each ball at the first position far enough from the last one, which leaves the most room for the rest.</p>
  </>} />
}
