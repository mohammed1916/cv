import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty record', description: 'No scores yet.' },
    { id: 'record', label: 'Record score', description: 'Push an integer score.' },
    { id: 'derive', label: 'Derive score', description: 'Push a sum or double of recent scores.' },
    { id: 'undo', label: 'Cancel score', description: 'Pop the most recent score.' },
    { id: 'done', label: 'Complete', description: 'Sum the record.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Operations (JSON array of strings)',
  url: 'https://leetcode.com/problems/baseball-game/',
  complexity: 'O(n) time and O(n) space for the stack.',
  examples: [
    { label: 'Mixed', input: '["5","2","C","D","+"]' },
    { label: 'Longer', input: '["5","-2","4","C","D","9","+","+"]' },
    { label: 'Simple', input: '["1","C"]' },
  ],
}

export default function BaseballGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StackLane title="Record" items={step.stack.map(String)} note={step.op ? `operation ${step.op}` : 'ready'} />
    <output aria-label="Total">Total: {step.phase === 'done' ? step.result : step.stack.reduce((a, b) => a + b, 0)}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Stack discipline:</strong> every operation touches only the most recent entries, so a stack records the state exactly.</p>
  </>} />
}
