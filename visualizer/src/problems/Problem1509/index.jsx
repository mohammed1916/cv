import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1509',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/minimum-difference-between-largest-and-smallest-value-in-three-moves/',
  complexity: 'O(n log n) time for the sort, then four constant-time windows.',
  examples: [
    { label: 'Sample A', input: '[1,20,3,22,2,21]' },
    { label: 'Spread out', input: '[9,4,1,7,15,8]' },
    { label: 'Short', input: '[5,1,9]' },
  ],
}

const chip = (text, on, dim) => ({
  minWidth: 40, padding: '4px 8px', fontFamily: 'monospace', textAlign: 'center', boxSizing: 'border-box',
  border: `${on ? 2 : 1}px solid ${on ? 'var(--text)' : 'var(--border)'}`,
  background: on ? '#bbf7d0' : 'transparent', color: dim ? 'var(--muted, #78716c)' : '#1c1917',
})

export default function MinDifferenceThreeMoves() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, left, right, best } = step.snapshot
    return <>
      {sorted ? <div role="img" aria-label="Sorted values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sorted.map((v, i) => <div key={i} style={chip(v, left !== null && i >= left && i <= right, left !== null && (i < left || i > right))}>{v}</div>)}
      </div> : <p>Values are read but not sorted yet.</p>}
      {left !== null && left !== undefined && <p>Kept window: indices {left} to {right}. Removed: {left} smallest and {3 - left} largest.</p>}
      <p>Narrowest width so far: <strong>{best === Infinity || best === null || best === undefined ? 'none yet' : best}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Three changes remove at most three values.</strong> Changing a value to any other is best when it moves an extreme value inward, so only the smallest and largest values matter.</p>
    <p><strong>Four splits.</strong> Remove a smallest and 3 - a largest, for a from 0 to 3. The kept values are one contiguous window of the sorted list.</p>
  </>} />
}
