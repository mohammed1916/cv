import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1342', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Whole number (for example 14)',
  url: 'https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/',
  complexity: 'O(log num) time, because every two steps at least halve the value, and O(1) extra space.',
}

export default function StepsToZeroVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <StackLane title="Current value" items={[String(s.value)]} note={s.rule ? `last rule: ${s.rule}` : undefined} />
      <StackLane title="Steps taken" items={[String(s.steps)]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Two rules:</strong> halve when even, subtract one when odd. Each halving at least halves the value, so the count stays logarithmic.</p>
    <p>{step.message}</p>
  </>} />
}
