import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'
import RaceView from './RaceView'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the task and the timer together.' },
    { id: 'wait', label: 'Wait', description: 'Neither has settled yet.' },
    { id: 'resolve', label: 'Resolve', description: 'The task wins the race.' },
    { id: 'reject', label: 'Reject', description: 'The limit wins the race.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with delay, limit and value (milliseconds)',
  url: 'https://leetcode.com/problems/promise-time-limit/',
  complexity: 'O(1) bookkeeping. The visualization only models the timing race, not the user function.',
  examples: [
    { label: 'Finishes in time', input: '{"delay":30,"limit":80,"value":"ready"}' },
    { label: 'Too slow', input: '{"delay":120,"limit":50,"value":"late"}' },
  ],
}

export default function PromiseTimeLimit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <RaceView frame={step} />} renderReasoning={() => <>
    <p>The wrapper races two settlements. Whichever happens first decides the promise, and the other is ignored.</p>
    <p>Comparing the delay with the limit decides the winner, because both start at the same moment.</p>
  </>} />
}
