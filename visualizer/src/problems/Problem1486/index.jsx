import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  question: "Compute the XOR of an arithmetic-style sequence start + 2i for i below n.",
  approaches: [
    { name: "Running XOR", intuition: "Generate each value and XOR it into one accumulator.", time: "O(n)", space: "O(1)" },
  ],
  number: '1486', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with n and start (JSON)',
  url: 'https://leetcode.com/problems/xor-operation-in-an-array/',
  complexity: 'O(n) time and O(1) extra space for the running XOR.',
}

export default function XorArrayVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    const n = run.input.n
    return <>
      <IndexedSequence label="Array: start + 2i" length={n} valueAt={i => (i < s.values.length ? s.values[i] : `${run.input.start} + 2·${i}`)}
        active={s.index} roleAt={i => (i < s.values.length ? 'added' : '')} />
      <StackLane title="Running XOR" items={[String(s.result)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Build then XOR:</strong> the array is never needed in full; each value can be XOR-ed in as it is produced.</p>
    <p>{step.message}</p>
  </>} />
}
