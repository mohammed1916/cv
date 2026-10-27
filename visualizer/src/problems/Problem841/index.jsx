import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Room 0 is unlocked; start the stack.' },
    { id: 'visit', label: 'Enter room', description: 'Pop a room and collect its keys.' },
    { id: 'key', label: 'New room', description: 'A key opens a room not yet visited.' },
    { id: 'skip', label: 'Known room', description: 'A key opens a room already visited.' },
    { id: 'done', label: 'Complete', description: 'Check that every room is visited.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Rooms (JSON array of key lists)',
  url: 'https://leetcode.com/problems/keys-and-rooms/',
  complexity: 'O(n + total keys) time and O(n) space: each room is pushed once and each key examined once.',
  examples: [
    { label: 'Example 1', input: '[[1],[2],[3],[]]' },
    { label: 'Example 2', input: '[[1,3],[3,0,1],[2],[0]]' },
    { label: 'Branching', input: '[[1,2],[3],[3,4],[],[0]]' },
  ],
}
export default function KeysAndRooms() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Room keys" length={run.input.length} active={step.current} valueAt={i => `[${run.input[i].join(',')}]`} roleAt={i => (step.visited[i] ? 'visited' : 'locked')} />
    <StackLane title="Stack of rooms to explore" items={step.stack} note={step.key === undefined ? '' : `key ${step.key}`} />
    <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result ? 'True' : 'False'}` : `Visited ${step.visited.filter(Boolean).length} of ${run.input.length}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why a visited array:</strong> keys can point back to rooms already opened (cycles). Marking a room when it is pushed guarantees each room enters the stack once.</p>
    <p>Rooms are the nodes and keys are directed edges; the question asks if every node is reachable from room 0.</p>
  </>} />
}
