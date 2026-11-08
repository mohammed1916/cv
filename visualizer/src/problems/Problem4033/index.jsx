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
    { label: "Two values", input: "{\"nums\":[5,9],\"k\":1,\"queries\":[[0,1]]}" },
    { label: "Equal values", input: "{\"nums\":[4,4,4],\"k\":2,\"queries\":[[0,2],[1,2]]}" },
    { label: "Largest and smallest values", input: "{\"nums\":[100,1,100,1,100],\"k\":5,\"queries\":[[0,4],[1,3]]}" },
    { label: "Long run: 20 values, 10 queries", input: "{\"nums\":[10,94,26,87,77,2,90,17,31,59,15,6,14,99,21,74,47,18,82,35],\"k\":7,\"queries\":[[4,8],[12,16],[16,19],[5,9],[5,17],[16,17],[0,11],[14,16],[5,6],[3,13]]}" },
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
