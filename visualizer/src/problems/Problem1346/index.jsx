import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
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
