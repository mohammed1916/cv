import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  number: '1486',
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Parameters (JSON object with n and start)',
  url: 'https://leetcode.com/problems/xor-operation-in-an-array/',
  complexity: 'O(n) time and O(1) extra space. The array is never stored; each value is computed as needed.',
  examples: [
    { label: 'Small', input: '{"n":4,"start":3}' },
    { label: 'Even start', input: '{"n":6,"start":8}' },
    { label: 'Single', input: '{"n":1,"start":7}' },
  ],
}

export default function XorOperationVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Generated values" length={run.input.n} valueAt={i => run.input.start + 2 * i}
      active={step.index} roleAt={i => (i <= step.index ? 'read' : '')} />
    <StackLane title="Running XOR" items={[String(step.result)]}
      note={step.value !== null ? `${step.before} XOR ${step.value}` : undefined} />
  </>} renderReasoning={({ step }) => <>
    <p>XOR is associative and self-cancelling, so the array never needs to be built: one running value is enough.</p>
    <p>{step.message}</p>
  </>} />
}
