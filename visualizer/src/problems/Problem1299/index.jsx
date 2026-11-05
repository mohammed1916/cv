import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1299', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/replace-elements-with-greatest-element-on-right-side/',
  complexity: 'O(n) time and O(n) extra space for the output copy.',
}

export default function GreatestRightVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Original values" length={run.input.length} valueAt={i => run.input[i]} active={s.index ?? -1}
        roleAt={i => (i === s.index ? 'scan' : '')} />
      <IndexedSequence label="Replaced values" length={run.input.length} valueAt={i => (s.filled[i] ? run.result?.[i] ?? '' : '?')} active={s.index ?? -1} />
      <StackLane title="Running maximum to the right" items={[String(s.best)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Right to left:</strong> each position needs only the greatest value to its right, which is a running maximum carried leftward.</p>
    <p>{step.message}</p>
  </>} />
}
