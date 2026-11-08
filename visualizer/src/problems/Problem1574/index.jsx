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
    { label: 'Single value', input: '[7]' },
    { label: 'Equal values', input: '[5,5,5]' },
    { label: 'Largest: 12 values', input: '[9,0,9,0,9,0,9,0,9,0,9,0]' },
    { label: 'Long run: 12 values', input: '[4,5,2,7,3,6,4,8,3,4,4,4]' },
  ],
}

const tile = (tone, active) => ({
  minWidth: 44, boxSizing: 'border-box', padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
  background: tone ?? 'transparent',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
})
const PREFIX = 'color-mix(in srgb, var(--primary) 30%, transparent)'
const SUFFIX = 'color-mix(in srgb, var(--accent, var(--primary)) 25%, transparent)'
const REMOVED = 'var(--surface2)'

export default function ShortestRemovalToSort() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { l, r, i, j, ans } = step.snapshot
    const arr = run.input
    const n = arr.length
    const pointerAt = k => [k === l && 'l', k === r && 'r', k === i && 'i', k === j && 'j'].filter(Boolean).join(' ')
    const removing = i !== undefined && j !== undefined && i < j - 1 && step.phase === 'pair'
    return <>
      <div role="img" aria-label="Array values with pointers" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((v, k) => {
          const tone = removing && k > i && k < j ? REMOVED : (l !== undefined && k <= l) ? PREFIX : (r !== undefined && k >= r) ? SUFFIX : undefined
          return <div key={k} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
            <small style={{ minHeight: 16, color: 'var(--text)' }}>{pointerAt(k)}</small>
            <div style={tile(tone, pointerAt(k) !== '')}>{v}<small> {k}</small></div>
          </div>
        })}
      </div>
      <p>Left shaded: sorted prefix, up to index {l ?? '-'} (pointer l). Right shaded: sorted suffix, from index {r ?? '-'} (pointer r).</p>
      {removing && <p>The grey cells between i and j are the block that would be removed for this join, length {j - i - 1}.</p>}
      <p>Pointer i (prefix end) is {i ?? '-'}; pointer j (suffix start) is {j ?? '-'}; of {n} values.</p>
      <p>Best removal so far: <strong>{ans}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two sorted ends:</strong> the kept part is a sorted prefix plus a sorted suffix, and the two must join in order.</p>
    <p><strong>Two pointers:</strong> moving the prefix end right never needs the suffix start to go left, so one forward scan finds the best join.</p>
  </>} />
}
