import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2007',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Changed array (JSON)',
  url: 'https://leetcode.com/problems/find-original-array-from-doubled-array/',
  complexity: 'O(n log n) time for the sort and O(n) for the count map.',
  examples: [
    { label: 'Doubled', input: '[2,4,1,8,4,2]' },
    { label: 'Not doubled', input: '[1,2,3]' },
    { label: 'Zeros', input: '[0,0]' },
  ],
}

export default function FindOriginalArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { changed, value, original, counts } = step.snapshot
    return <>
      <p>Remaining counts (value × copies): {counts.length ? counts.map(([v, c]) => `${v}×${c}`).join(' · ') : 'none left'}</p>
      <p>Smallest unmatched value: <strong>{value ?? '-'}</strong>{value !== null ? `, its double ${2 * value}` : ''}.</p>
      <p>Originals so far: <strong>{original.length ? original.join(', ') : 'none'}</strong></p>
      <p>Input length {changed.length}: {changed.length % 2 ? 'odd, so no answer' : 'even, so matching is possible'}.</p>
    </>
  }} renderReasoning={() => <p>The smallest remaining value cannot be a double of anything left, so it must be an original and its double must be present. Repeating this from the smallest value decides the answer.</p>} />
}
