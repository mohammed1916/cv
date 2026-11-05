import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Add every value once.' },
    { id: 'check', label: 'Compare', description: 'Left sum against right sum at index i.' },
    { id: 'advance', label: 'Advance', description: 'Move the index one step right.' },
    { id: 'found', label: 'Pivot', description: 'The first balanced index is the answer.' },
    { id: 'done', label: 'Complete', description: 'Return the index or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums (JSON object with a nums array)',
  url: 'https://leetcode.com/problems/find-pivot-index/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Balanced', input: '{"nums":[1,2,3,3]}' },
    { label: 'None', input: '{"nums":[1,2,3,4]}' },
    { label: 'Edge', input: '{"nums":[4,-2,2]}' },
  ],
}

export default function FindPivotIndex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums (left of i, i, right of i)" length={run.input.length} active={step.index}
      valueAt={i => run.input[i]}
      roleAt={i => (i === step.index ? 'i' : i < step.index ? 'left' : 'right')} />
    <table aria-label="Side sums">
      <tbody>
        <tr><th scope="row">Total</th><td>{step.total}</td></tr>
        <tr><th scope="row">Left sum</th><td>{step.leftSum}</td></tr>
        <tr><th scope="row">Right sum</th><td>{step.rightSum ?? '–'}</td></tr>
      </tbody>
    </table>
    <output aria-label="Result">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The right sum is never summed again: it equals the total minus the left sum minus the current value.</p>
    <p>The first index where those two match is returned, so ties on the left are resolved in favour of the smallest index.</p>
  </>} />
}
