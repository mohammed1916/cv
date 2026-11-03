import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  number: '1480',
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array (JSON array of integers)',
  url: 'https://leetcode.com/problems/running-sum-of-1d-array/',
  complexity: 'O(n) time and O(n) output space. The visualization caps the array at 200 values.',
  examples: [
    { label: 'Mixed signs', input: '[3,-1,4,1,-5,9]' },
    { label: 'Ramp', input: '[1,2,3,4,5]' },
    { label: 'Single', input: '[7]' },
  ],
}

export default function RunningSumVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} valueAt={i => run.input[i]} active={step.cursor}
      roleAt={i => (i < step.output.length ? 'read' : '')} />
    <StackLane title="Running total" items={[String(step.total)]} note={step.before !== null && step.before !== undefined ? `previous total ${step.before}` : undefined} />
    <IndexedSequence label="Prefix sums" length={run.input.length} valueAt={i => (i < step.output.length ? step.output[i] : '')} active={step.cursor}
      roleAt={i => (i < step.output.length ? 'read' : '')} />
  </>} renderReasoning={({ step }) => <>
    <p>Each answer is the previous answer plus the current value, so one pass with a single running total is enough.</p>
    <p>{step.message}</p>
  </>} />
}
