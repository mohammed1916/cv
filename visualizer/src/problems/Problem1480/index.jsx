import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1480', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/running-sum-of-1d-array/',
  complexity: 'O(n) time and O(n) space for the output.',
}

export default function RunningSumVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot
    return <>
      <IndexedSequence label="Input values" length={run.input.length} valueAt={i => run.input[i]} active={s.index}
        roleAt={i => (i === s.index ? 'added' : i < s.result.length ? 'summed' : '')} />
      <IndexedSequence label="Running sums" length={run.input.length} valueAt={i => (i < s.result.length ? s.result[i] : '·')} active={s.index} />
      <StackLane title="Running total" items={[String(s.total)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>One pass:</strong> each answer is the previous answer plus the next value, so keeping one running total is enough.</p>
    <p>{step.message}</p>
  </>} />
}
