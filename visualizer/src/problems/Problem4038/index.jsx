import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BlockView from './BlockView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty table of blocks.' },
    { id: 'scan', label: 'Scan', description: 'Look at the next index.' },
    { id: 'run', label: 'New block', description: 'This value starts a new block.' },
    { id: 'continue', label: 'Continue', description: 'This value extends the open block.' },
    { id: 'count', label: 'Count', description: 'Collect values with one block.' },
    { id: 'done', label: 'Result', description: 'Return the count.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array of values (e.g. [1,2,2,1])',
  url: 'https://leetcode.com/problems/count-integers-appearing-in-a-single-block/',
  complexity: 'O(n) time and O(d) space for n values with d distinct values. The visualization caps the array at 20 values; the official limit is 100.',
  examples: [
    { label: 'Mixed blocks', input: '[1,2,2,1,3,3,3,4]' },
    { label: 'Split value', input: '[5,5,6,5]' },
  ],
}

export default function CountIntegersSingleBlock() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BlockView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
