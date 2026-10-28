import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Everyone starts online with zero mentions.' },
    { id: 'offline', label: 'Offline', description: 'A user goes offline and returns 60 time units later.' },
    { id: 'message', label: 'Message', description: 'Count the mentions the string names.' },
    { id: 'done', label: 'Complete', description: 'Report the mention count for each user.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with numberOfUsers and events [type, timestamp, value]',
  url: 'https://leetcode.com/problems/count-mentions-per-user/',
  complexity: 'O(e log e + e * u) time for e events and u users. The visualization caps input at 20 events.',
  examples: [
    { label: 'HERE after return', input: '{"numberOfUsers":2,"events":[["MESSAGE","10","id1 id0"],["OFFLINE","11","0"],["MESSAGE","71","HERE"]]}' },
    { label: 'Still offline', input: '{"numberOfUsers":2,"events":[["OFFLINE","10","0"],["MESSAGE","12","HERE"]]}' },
  ],
}

export default function CountMentions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="Mentions per user" length={run.input.numberOfUsers} valueAt={u => step.counts[u]} active={-1} />
      <output aria-label="Event">{step.event ? `Event: ${step.event.join(' ')}` : 'Start'}</output>
    </>
  )} renderReasoning={() => <>
    <p>An offline user returns 60 time units after going offline, and events at the same timestamp are handled in a fixed order so the status is right when a message arrives.</p>
    <p>HERE counts only users online at that moment, while ALL and explicit ids count everyone named.</p>
  </>} />
}
