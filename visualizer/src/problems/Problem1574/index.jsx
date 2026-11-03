import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1574',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of digits (JSON)',
  url: 'https://leetcode.com/problems/shortest-subarray-to-be-removed-to-make-array-sorted/',
  complexity: 'O(n) time and O(1) extra space: two pointers move only forward over the array.',
  examples: [
    { label: 'Two breaks', input: '[4,3,1,2,6,5,1,9]' },
    { label: 'One gap', input: '[1,2,8,3,5]' },
    { label: 'Already sorted', input: '[1,2,3]' },
  ],
}

const tile = (value, tone, active) => ({
  minWidth: 44, boxSizing: 'border-box', padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace',
  background: tone ?? 'transparent', color: tone ? '#1c1917' : 'inherit',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
})

export default function ShortestRemovalToSort() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { l, r, i, j, ans } = step.snapshot
    const arr = run.input
    return <>
      <div role="img" aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((v, k) => {
          const tone = l !== undefined && k <= l ? '#bbf7d0' : r !== undefined && k >= r ? '#bfdbfe' : undefined
          const mark = k === i ? ' i' : k === j ? ' j' : ''
          return <div key={k} style={tile(v, tone, k === i || k === j)}>{v}<small> {k}{mark}</small></div>
        })}
      </div>
      <p>Green: sorted prefix (up to index {l ?? '-'}). Blue: sorted suffix (from index {r ?? '-'}).</p>
      <p>Best removal so far: <strong>{ans}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two sorted ends:</strong> the kept part is a sorted prefix plus a sorted suffix, and the two must join in order.</p>
    <p><strong>Two pointers:</strong> moving the prefix end right never needs the suffix start to go left, so one forward scan finds the best join.</p>
  </>} />
}
