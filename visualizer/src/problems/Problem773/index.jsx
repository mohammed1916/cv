import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, TARGET } from './algorithm'

const rowOf = (state, r) => [...state.slice(r * 3, r * 3 + 3)]
const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Encode the board as a string and enqueue it.' },
    { id: 'expand', label: 'Expand', description: 'Dequeue a board and slide the blank in every direction.' },
    { id: 'solved', label: 'Solved', description: 'The target board was dequeued.' },
    { id: 'done', label: 'Complete', description: 'Return the move count, or -1 if the queue empties.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Board 2x3 (JSON)',
  url: 'https://leetcode.com/problems/sliding-puzzle/',
  complexity: 'At most 6! = 720 states with up to 3 neighbours each: O(6! * 6) time, O(6!) space.',
  examples: [
    { label: '[[1,2,3],[4,0,5]] -> 1', input: '[[1,2,3],[4,0,5]]' },
    { label: '[[1,2,3],[5,4,0]] -> -1', input: '[[1,2,3],[5,4,0]]' },
    { label: '[[4,1,2],[5,0,3]] -> 5', input: '[[4,1,2],[5,0,3]]' },
    { label: 'Long solve (14 moves)', input: '[[3,2,4],[1,5,0]]' },
  ],
}
export default function SlidingPuzzle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Current board, top row" length={3} valueAt={i => (rowOf(step.state, 0)[i] === '0' ? '_' : rowOf(step.state, 0)[i])} roleAt={i => (rowOf(step.state, 0)[i] === '0' ? 'blank' : '')} />
    <IndexedSequence label="Current board, bottom row" length={3} indexOffset={3} valueAt={i => (rowOf(step.state, 1)[i] === '0' ? '_' : rowOf(step.state, 1)[i])} roleAt={i => (rowOf(step.state, 1)[i] === '0' ? 'blank' : '')} />
    <output aria-label="BFS state">Board "{step.state}" at distance {step.dist < 0 ? 'n/a' : step.dist} | queue: {step.queueSize} | seen: {step.seen}{step.added.length ? ` | new: ${step.added.join(', ')}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why BFS:</strong> every slide costs one move, so queue order is nondecreasing distance. The first time the goal "{TARGET}" is dequeued is optimal; a visited set keeps the 720 reachable states from repeating.</p>
  </>} />
}
