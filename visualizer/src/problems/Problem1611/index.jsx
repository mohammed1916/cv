import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with n and a result of zero.' },
    { id: 'fold', label: 'XOR value', description: 'Fold the current value into the result.' },
    { id: 'shift', label: 'Shift', description: 'Move to the next lower bit position.' },
    { id: 'done', label: 'Complete', description: 'Report the accumulated result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n from 0 to 1023, e.g. {"n":3}',
  url: 'https://leetcode.com/problems/minimum-one-bit-operations-to-make-integers-zero/',
  complexity: 'O(log n) time and O(1) space. The visualization caps n at 1023.',
  examples: [
    { label: 'Example 1', input: '{"n":3}' },
    { label: 'Example 2', input: '{"n":6}' },
  ],
}

export default function MinimumOneBitOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const bits = x => x.toString(2).padStart(10, '0')
    return <table aria-label="Bit folding">
      <thead><tr><th>Value</th><th>Binary</th></tr></thead>
      <tbody>
        <tr><th>Current value</th><td>{step.rest} ({bits(step.rest)})</td></tr>
        <tr><th>Result</th><td>{step.result} ({bits(step.result)})</td></tr>
        <tr><th>Bit position</th><td>{step.bit < 0 ? '(none)' : step.bit}</td></tr>
      </tbody>
    </table>
  }} renderReasoning={() => <>
    <p>The answer is the XOR of n and all of its right shifts. Each operation changes one bit in a fixed order, so the minimum count is the inverse Gray code of n.</p>
    <p>The loop folds each shifted value into the result, which reproduces that XOR bit by bit from the top.</p>
  </>} />
}
