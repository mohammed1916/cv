import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1500',
  phases: [
    { id: 'start', label: 'Empty', description: 'No users have joined.' },
    { id: 'join', label: 'Join', description: 'Hand out the smallest free id.' },
    { id: 'leave', label: 'Leave', description: 'Remove a user and free its id.' },
    { id: 'request', label: 'Request', description: 'List the other owners, then the requester owns the chunk.' },
    { id: 'done', label: 'Result', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: ["join", [chunks]], ["leave", id] or ["request", id, chunk]',
  url: 'https://leetcode.com/problems/design-a-file-sharing-system/',
  complexity: 'O(U) per join for U users in this scan version, and O(U) per request. A heap of free ids would make join faster.',
  examples: [
    { label: 'Example', input: '{"ops":[["join",[1,2]],["join",[2,3]],["request",2,1],["leave",1],["join",[9]],["request",2,3]]}' },
  ],
}

export default function DesignAFileSharingSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Users and chunks">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Freed ids are reused, so the next join always takes the smallest id that no user is holding.</p>
    <p>A request reports the other owners first and only then records the requester as a new owner of that chunk.</p>
  </>} />
}
