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
    { label: 'Keys open a chain', input: '[[1],[2],[3],[]]' },
    { label: 'Cycle with spare keys', input: '[[1,3],[3,0,1],[2],[0]]' },
    { label: 'Branching', input: '[[1,2],[3],[3,4],[],[0]]' },
    { label: 'Two rooms, key to the second', input: '[[1],[]]' },
    { label: 'Duplicate keys', input: '[[1,1],[]]' },
    { label: 'Longest chain of 30 rooms', input: '[[1],[2],[3],[4],[5],[6],[7],[8],[9],[10],[11],[12],[13],[14],[15],[16],[17],[18],[19],[20],[21],[22],[23],[24],[25],[26],[27],[28],[29],[]]' },
    { label: 'Long run: 30 rooms with random keys', input: '[[5],[2],[4,27],[9,21],[5,4,13],[16],[9,4],[0,8],[12],[24],[13,14,12],[20,13,13],[21,29],[13,25,9],[17],[21,23],[3],[],[1,17],[12,11],[23,14,20],[18,0],[22],[],[27,28,3],[],[20,9,11],[],[10],[12]]' },
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
