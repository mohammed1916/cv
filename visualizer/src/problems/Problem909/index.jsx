import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Flatten', description: 'Flatten the board and seed the queue with square 1.' },
    { id: 'pop', label: 'Dequeue', description: 'Take the next square from the queue.' },
    { id: 'expand', label: 'Roll dice', description: 'Try rolls 1 to 6, following snakes and ladders.' },
    { id: 'done', label: 'Complete', description: 'Read the distance of the last square.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Board (JSON 2D array)',
  url: 'https://leetcode.com/problems/snakes-and-ladders/',
  complexity: 'O(n^2) time and space: each square is enqueued once and tries 6 rolls. Boards are capped at 20 x 20.',
  examples: [
    { label: 'Example 1', input: '[[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]' },
    { label: 'Example 2', input: '[[-1,-1],[-1,3]]' },
    { label: 'Unreachable end', input: '[[1,1,-1],[1,1,1],[-1,1,1]]' },
  ],
}

export default function SnakesAndLadders() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Squares: snake/ladder destination (· = plain)" length={run.cells.length - 1} indexOffset={1} active={step.cur - 1}
      valueAt={i => run.cells[i + 1] === -1 ? '·' : run.cells[i + 1]} roleAt={i => step.discovered.includes(i + 1) ? 'found' : run.cells[i + 1] === -1 ? '' : run.cells[i + 1] > i + 1 ? 'ladder' : 'snake'} />
    <IndexedSequence label="Distance (moves) per square" length={step.dist.length - 1} indexOffset={1} active={step.cur - 1}
      valueAt={i => step.dist[i + 1] === -1 ? '–' : step.dist[i + 1]} roleAt={i => step.dist[i + 1] === -1 ? '' : 'seen'} />
    <StackLane title="BFS queue (front first)" items={step.queue.map(String)} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Every roll costs one move, so BFS reaches each square in the fewest moves the first time it is discovered. A snake or ladder redirects the landing square for free.</p>
  </>} />
}
