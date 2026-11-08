import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'
import RaceView from './RaceView'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the task and the timer together.' },
    { id: 'wait', label: 'Wait', description: 'Neither has settled yet.' },
    { id: 'resolve', label: 'Resolve', description: 'The task wins the race.' },
    { id: 'reject', label: 'Reject', description: 'The limit wins the race.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with delay, limit and value (milliseconds)',
  url: 'https://leetcode.com/problems/promise-time-limit/',
  complexity: 'O(1) bookkeeping. The visualization only models the timing race, not the user function.',
  examples: [
    { label: 'Finishes in time', input: '{"delay":30,"limit":80,"value":"ready"}' },
    { label: 'Too slow', input: '{"delay":120,"limit":50,"value":"late"}' },
    { label: 'Zero delay and limit', input: '{"delay":0,"limit":0,"value":""}' },
    { label: 'Delay equals limit', input: '{"delay":100,"limit":100,"value":"edge"}' },
    { label: 'Longest allowed value', input: '{"delay":500,"limit":500,"value":"12345678901234567890"}' },
    { label: 'Long run: mid-range timing', input: '{"delay":247,"limit":311,"value":"almost there"}' },
  ],
}

export default function PromiseTimeLimit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <RaceView frame={step} />} renderReasoning={() => <>
    <p>The wrapper races two settlements. Whichever happens first decides the promise, and the other is ignored.</p>
    <p>Comparing the delay with the limit decides the winner, because both start at the same moment.</p>
  </>} />
}
