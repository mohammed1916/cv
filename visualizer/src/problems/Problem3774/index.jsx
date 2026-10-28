import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort a copy of the numbers.' },
    { id: 'small', label: 'Smallest k', description: 'Sum the k smallest values.' },
    { id: 'large', label: 'Largest k', description: 'Sum the k largest values.' },
    { id: 'done', label: 'Complete', description: 'Report the absolute difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/absolute-difference-between-maximum-and-minimum-k-elements/',
  complexity: 'O(n log n) time for sorting. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5,2,2,4],"k":2}' },
    { label: 'Single', input: '{"nums":[100],"k":1}' },
  ],
}

export default function AbsoluteDifferenceMaxMinKElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.sorted.length
    const k = run.input.k
    const roleAt = i => {
      if (step.phase === 'small' && i < k) return 'smallest'
      if (step.phase === 'large' && i >= n - k) return 'largest'
      if (step.phase === 'done' && (i < k || i >= n - k)) return 'counted'
      return ''
    }
    return <IndexedSequence label="Sorted values" length={n} valueAt={i => run.sorted[i]} active={-1} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>After sorting, the k smallest values are at the front and the k largest are at the back.</p>
  </>} />
}
