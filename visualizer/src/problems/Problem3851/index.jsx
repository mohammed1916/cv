import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3851View from './Problem3851View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Group', description: 'Collect each user\'s requests.' },
    { id: 'user', label: 'User', description: 'Start a user\'s timeline in time order.' },
    { id: 'check', label: 'Check', description: 'Test whether this request fits the limit.' },
    { id: 'keep', label: 'Keep', description: 'The request fits, so retain it.' },
    { id: 'drop', label: 'Drop', description: 'Keeping it would overfill some window.' },
    { id: 'done', label: 'Result', description: 'Report the retained total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with k, span and requests ([user, time] pairs)',
  url: 'https://leetcode.com/problems/maximum-requests-without-violating-the-limit/',
  complexity: 'O(n log n) time for sorting the requests, O(n) extra space. Users are independent, so each timeline is handled alone. The visualization caps the input at 14 requests.',
  examples: [
    { label: 'Two users', input: '{"k":2,"span":5,"requests":[["ana",1],["ana",3],["ana",4],["ben",2],["ana",9],["ben",3],["ben",4],["ben",5]]}' },
    { label: 'Tight limit', input: '{"k":1,"span":3,"requests":[["max",0],["max",2],["max",4],["max",9],["max",10]]}' },
  ],
}

export default function Problem3851Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3851View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Keeping the earliest feasible times is optimal: each kept time is no later than the matching kept time of any other valid choice, so no window can be overfilled later.</p>
  </>} />
}
