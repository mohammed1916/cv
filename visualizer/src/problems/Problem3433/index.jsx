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
    { label: 'Single user', input: '{"numberOfUsers":1,"events":[["MESSAGE","1","id0"]]}' },
    { label: 'Same timestamp tie', input: '{"numberOfUsers":2,"events":[["MESSAGE","5","HERE"],["MESSAGE","5","id1"]]}' },
    { label: 'Offline window edge', input: '{"numberOfUsers":2,"events":[["OFFLINE","1","0"],["MESSAGE","61","HERE"],["MESSAGE","62","HERE"]]}' },
    { label: 'Long run: 20 events', input: '{"numberOfUsers":10,"events":[["MESSAGE","4","id2 id3"],["OFFLINE","7","7"],["OFFLINE","16","5"],["MESSAGE","25","ALL"],["MESSAGE","33","ALL"],["OFFLINE","34","9"],["MESSAGE","36","ALL"],["MESSAGE","43","ALL"],["MESSAGE","50","ALL"],["MESSAGE","53","ALL"],["MESSAGE","58","ALL"],["MESSAGE","64","id5 id6"],["MESSAGE","70","HERE"],["OFFLINE","77","1"],["OFFLINE","84","9"],["OFFLINE","85","8"],["OFFLINE","91","6"],["OFFLINE","93","1"],["MESSAGE","97","HERE"],["MESSAGE","98","ALL"]]}' },
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
