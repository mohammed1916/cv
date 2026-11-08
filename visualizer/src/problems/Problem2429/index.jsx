import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BitGridView from './BitGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num1 and num2 from 1 to 1023, e.g. {"num1":3,"num2":5}',
  url: 'https://leetcode.com/problems/minimize-xor/',
  complexity: 'O(log M) time and O(1) space, where M bounds the bit width. The visualization caps values at 1023.',
  examples: [
    { label: 'Own case 1', input: '{"num1":4,"num2":6}' },
    { label: 'Own case 2', input: '{"num1":2,"num2":13}' },
    { label: 'Smallest values', input: '{"num1":1,"num2":1}' },
    { label: 'Equal values', input: '{"num1":10,"num2":10}' },
    { label: 'Largest values', input: '{"num1":1023,"num2":1023}' },
    { label: 'Long run: large mixed values', input: '{"num1":646,"num2":646}' },
  ],
}

export default function MinimizeXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <BitGridView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>x must have as many set bits as num2. Setting the high bits that num1 already has removes the largest differences first.</p>
      <p>Any remaining bits go to the lowest free positions, which cost the least in XOR.</p>
      <p>{step.message}</p>
    </>} />
}
