import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2460',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Read the array from the left.' },
    { id: 'compare', label: 'Compare', description: 'Check an adjacent pair.' },
    { id: 'double', label: 'Double', description: 'Double the left value of an equal pair.' },
    { id: 'zero', label: 'Zero', description: 'Zero the right value of the pair.' },
    { id: 'shift', label: 'Shift', description: 'Move the nonzero values to the front.' },
    { id: 'done', label: 'Result', description: 'Return the rearranged array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [1,2,2,1,1,0]}',
  url: 'https://leetcode.com/problems/apply-operations-to-an-array/',
  complexity: 'O(n) time and O(n) extra space for the output. The visualization caps nums at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,2,1,1,0]}' },
    { label: 'Example 2', input: '{"nums":[0,1]}' },
  ],
}

export default function ApplyOperationsToArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="array" length={step.state.length} valueAt={i => step.state[i]} active={step.at}
      roleAt={i => (step.phase === 'zero' && i === step.at ? 'zeroed' : step.phase === 'compare' && (i === step.at || i === step.at + 1) ? 'pair' : '')} />
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Scanning left to right, an equal adjacent pair becomes a doubled left value and a zero on the right. The doubled value is not compared again, because the scan has already moved past it.</p>
    <p>Moving every nonzero value to the front keeps their order, and the zeros fill the rest.</p>
  </>} />
}
