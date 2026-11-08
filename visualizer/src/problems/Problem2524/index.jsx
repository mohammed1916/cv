import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyWindowView from './FrequencyWindowView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2524',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start with an empty window.' },
    { id: 'add', label: 'Add', description: 'Enter the next number and update its term.' },
    { id: 'remove', label: 'Remove', description: 'Drop the number that left the window.' },
    { id: 'window', label: 'Window', description: 'Compare this full window with the best so far.' },
    { id: 'done', label: 'Result', description: 'Report the best reduced score.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (whole numbers from 1 to 20) and k',
  url: 'https://leetcode.com/problems/maximum-frequency-score-of-a-subarray/',
  complexity: 'O(n) window steps with O(log f) modular powers each, using a hash map of counts, for n numbers and window length k. The visualization caps nums at 12 values from 1 to 20; the official limits are larger.',
  examples: [
    { label: 'Repeated run', input: '{"nums":[2,2,1,2,3],"k":3}' },
    { label: 'Two values', input: '{"nums":[5,1,5,1,5,2],"k":4}' },
    { label: 'All equal', input: '{"nums":[3,3,3,3],"k":2}' },
    { label: 'Single number', input: '{"nums":[4],"k":1}' },
    { label: 'Equal frequencies', input: '{"nums":[1,2,1,2],"k":2}' },
    { label: 'Longest array, k = length', input: '{"nums":[20,1,20,1,20,1,20,1,20,1,20,1],"k":12}' },
    { label: 'Long run: 12 numbers', input: '{"nums":[7,8,15,14,13,11,4,6,19,7,19,6],"k":6}' },
  ],
}

export default function MaximumFrequencyScoreOfASubarray() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FrequencyWindowView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Adding one more copy of a value raises its term from v^c to v^(c+1); removing one lowers it again.</p>}
    />
  )
}
