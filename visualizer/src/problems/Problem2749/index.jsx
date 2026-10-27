import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Try operation counts in increasing order.' },
    { id: 'try', label: 'Try k', description: 'Compute the remaining value after k operations.' },
    { id: 'reject', label: 'Reject', description: 'This k cannot work.' },
    { id: 'accept', label: 'Accept', description: 'This k works, so it is the minimum.' },
    { id: 'done', label: 'Complete', description: 'No k works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'num1 and num2 as JSON, e.g. {"num1": 3, "num2": -2}',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-the-integer-zero/',
  complexity: 'O(log num1) time per k, and at most 65 values of k.',
  examples: [
    { label: 'Example 1', input: '{"num1": 3, "num2": -2}' },
    { label: 'Example 2', input: '{"num1": 5, "num2": 7}' },
  ],
}

export default function MakeIntegerZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <>
      <table aria-label="Current attempt">
        <tbody>
          <tr><th scope="row">Operations k</th><td>{step.k ?? '-'}</td></tr>
          <tr><th scope="row">Remaining x</th><td>{step.x ?? '-'}</td></tr>
          <tr><th scope="row">Set bits in x</th><td>{step.bits ?? '-'}</td></tr>
        </tbody>
      </table>
      <output aria-label="Current step">{step.message}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>After k operations, num1 minus k times num2 must equal a sum of exactly k powers of two.</p>
      <p>A number is a sum of exactly k powers of two when it has at least k in value and at most k set bits, so the first k that passes is the answer.</p>
    </>
  )} />
}
