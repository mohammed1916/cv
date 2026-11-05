import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty record', description: 'No scores yet.' },
    { id: 'score', label: 'Record score', description: 'An integer is pushed as a new score.' },
    { id: 'cancel', label: 'C: cancel', description: 'Remove the most recent score.' },
    { id: 'double', label: 'D: double', description: 'Push twice the most recent score.' },
    { id: 'sum', label: '+: add two', description: 'Push the sum of the two most recent scores.' },
    { id: 'done', label: 'Total', description: 'Add every score still on the record.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Operations (JSON array of strings)',
  url: 'https://leetcode.com/problems/baseball-game/',
  complexity: 'O(n) time and O(n) space for the record.',
  examples: [
    { label: 'Cancel', input: '["4","7","C","D","+"]' },
    { label: 'Mixed signs', input: '["3","-1","+","D","C","6"]' },
    { label: 'Only cancels', input: '["2","C","9","C"]' },
  ],
}

export default function BaseballGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="Score record" items={step.stack.map(String)} dropped={step.dropped.map(String)}
      note={step.op ? `operation ${step.op}` : 'start'} />
    <output aria-label="Running total">{`Total so far: ${step.stack.reduce((a, b) => a + b, 0)}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why a stack:</strong> each operation only needs the latest one or two scores, which is exactly what the top of a stack gives.</p>
  </>} />
}
