import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ValidSubarrayView from './ValidSubarrayView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare the answer list.' },
    { id: 'query', label: 'Query', description: 'Pick the next range.' },
    { id: 'reset', label: 'Reset', description: 'Clear the count table.' },
    { id: 'add', label: 'Count', description: 'Add one value from the range.' },
    { id: 'check', label: 'Check', description: 'Test the distinct count and parity.' },
    { id: 'record', label: 'Record', description: 'Store the Boolean answer.' },
    { id: 'done', label: 'Result', description: 'Return every answer.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums, k and queries ([l, r] pairs), e.g. {"nums":[1,1],"k":1,"queries":[[0,1]]}',
  url: 'https://leetcode.com/problems/valid-k-unique-subarrays-i/',
  complexity: 'O(q * n) time for q queries over an array of length n, with a fresh count table per query. The visualization caps nums at 20 values and queries at 10; the official limits are larger.',
  examples: [
    { label: 'Mixed ranges', input: '{"nums":[2,2,5,5,2,2,8,8],"k":2,"queries":[[0,3],[0,5],[4,7],[1,7]]}' },
    { label: 'Three values', input: '{"nums":[1,2,2,3,1,3],"k":3,"queries":[[0,5],[1,2],[0,3]]}' },
  ],
}

export default function ValidKUniqueSubarraysI() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ValidSubarrayView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
