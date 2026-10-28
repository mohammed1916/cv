import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Start from the target and undo moves backward.' },
    { id: 'visit', label: 'Undo', description: 'Each state has at most four predecessors; keep the ones not below the start.' },
    { id: 'done', label: 'Complete', description: 'Report the number of undone moves, or -1 when the start is unreachable.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array [sx, sy, tx, ty]',
  url: 'https://leetcode.com/problems/minimum-moves-to-reach-target-in-grid/',
  complexity: 'Each backward step shrinks the larger coordinate, so the search depth is O(log max(tx, ty)).',
  examples: [
    { label: 'Example 1', input: '[1,2,5,4]' },
    { label: 'Example 2', input: '[0,1,2,3]' },
    { label: 'Unreachable', input: '[1,1,2,2]' },
  ],
}

export default function MinimumMovesTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Current state">{step.state ? `State: (${step.state[0]}, ${step.state[1]}), distance ${step.distance}` : `No path, answer ${step.distance}`}</output>
    <output aria-label="Start">{`Start: (${run.input[0]}, ${run.input[1]}), target: (${run.input[2]}, ${run.input[3]})`}</output>
  </>} renderReasoning={() => <>
    <p>A move adds the larger coordinate to one of the two coordinates, so the values only grow. Run the walk in reverse from the target.</p>
    <p>Undoing a move has at most four possibilities, and the search keeps only states that are not below the start in either coordinate.</p>
  </>} />
}
