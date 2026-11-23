import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  question: "Check whether one value is exactly double another value in the array.",
  approaches: [
    { name: "Hash set", intuition: "For each value check whether its half or its double has been seen.", time: "O(n)", space: "O(n)" },
    { name: "Sort and search", intuition: "After sorting, search for the double of each value.", time: "O(n log n)", space: "O(1)" },
  ],
  number: '1346', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/check-if-n-and-its-double-exist/',
  complexity: 'O(n) time and O(n) space for the set of seen values.',
}

export default function DoubleExistsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} active={s.index}
        roleAt={i => (i === s.index ? 'current' : '')} />
      <StackLane title="Seen so far" items={s.seen.map(String)} note={s.found ? `pair found at ${s.x}` : undefined} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Look both ways:</strong> a pair (x, 2x) is found from whichever value comes second, so checking x against the double and the half of earlier values is enough.</p>
    <p>{step.message}</p>
  </>} />
}
