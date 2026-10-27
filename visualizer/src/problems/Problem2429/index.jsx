import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count the set bits that x must have.' },
    { id: 'match', label: 'Match num1', description: 'Set high bits of x that num1 also has, while the budget lasts.' },
    { id: 'fill', label: 'Fill lowest', description: 'Spend the remaining budget on the lowest free bits.' },
    { id: 'done', label: 'Complete', description: 'Report x.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num1 and num2 from 1 to 1023, e.g. {"num1":3,"num2":5}',
  url: 'https://leetcode.com/problems/minimize-xor/',
  complexity: 'O(log M) time and O(1) space, where M bounds the bit width. The visualization caps values at 1023.',
  examples: [
    { label: 'Example 1', input: '{"num1":3,"num2":5}' },
    { label: 'Example 2', input: '{"num1":1,"num2":12}' },
  ],
}

const bits = v => v.toString(2).padStart(10, '0')

export default function MinimizeXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Bit comparison">
      <thead><tr><th>Number</th><th>Binary (bit 9 to 0)</th></tr></thead>
      <tbody>
        <tr><th>num1</th><td>{bits(run.input.num1)}</td></tr>
        <tr><th>x so far</th><td>{bits(step.result)}</td></tr>
        <tr><th>Still needed</th><td>{step.need}</td></tr>
      </tbody>
    </table>
    <output aria-label="Bit being decided">{step.bit < 0 ? 'No bit decided yet' : `Bit ${step.bit} decided`}</output>
  </>} renderReasoning={() => <>
    <p>x must have as many set bits as num2. Setting the high bits that num1 already has removes the largest differences first.</p>
    <p>Any remaining bits go to the lowest free positions, which cost the least in XOR.</p>
  </>} />
}
