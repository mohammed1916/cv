import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a total of 0.' },
    { id: 'fold', label: 'Fold XOR', description: 'XOR each value into the total.' },
    { id: 'diff', label: 'Difference', description: 'Compare the total with k.' },
    { id: 'bit', label: 'Flip bit', description: 'Remove one differing bit, which costs one flip.' },
    { id: 'done', label: 'Complete', description: 'Report the flip count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (up to 20 values from 0 to 15) and k (0 to 15)',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-make-array-xor-equal-to-k/',
  complexity: 'O(n) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"nums": [2,1,3,4], "k": 1}' },
    { label: 'Example 2', input: '{"nums": [2,0,2,0], "k": 0}' },
  ],
}

export default function XorToK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <table aria-label="XOR state">
      <tbody>
        <tr><th scope="row">Values</th><td>{run.nums.join(', ')}</td></tr>
        <tr><th scope="row">Total XOR</th><td>{step.total}</td></tr>
        <tr><th scope="row">Differing bits</th><td>{step.diff ?? 'not yet computed'}</td></tr>
        <tr><th scope="row">Flips</th><td>{step.flips}</td></tr>
      </tbody>
    </table>
  )} renderReasoning={() => <>
    <p>Flipping one bit of one element changes the XOR of the whole array in exactly that bit.</p>
    <p>So the fewest flips equal the number of bits where the array XOR differs from k.</p>
  </>} />
}
