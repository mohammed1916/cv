import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top-left cell with no portal letters used.' },
    { id: 'layer', label: 'Move layer', description: 'Expand every state reachable with the same number of moves.' },
    { id: 'teleport', label: 'Teleport', description: 'Step on an unused portal letter and jump to a matching cell for free.' },
    { id: 'done', label: 'Complete', description: 'Report the moves needed to reach the bottom-right cell.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with matrix (JSON array of strings)',
  url: 'https://leetcode.com/problems/grid-teleportation-traversal/',
  complexity: 'O(cells * 2^letters) states. The visualization caps the grid at 5 by 5 with at most 6 letters.',
  examples: [
    { label: 'Example 1', input: '{"matrix":["A..",".A.","..."]}' },
    { label: 'Example 2', input: '{"matrix":[".#...",".#.#.",".#.#.","...#."]}' },
  ],
}

export default function GridTeleportationTraversal() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Grid cells (row-major)" length={run.input.matrix.length * run.input.matrix[0].length}
      valueAt={i => run.input.matrix[Math.floor(i / run.input.matrix[0].length)][i % run.input.matrix[0].length]}
      active={step.at ?? -1} />
    <output aria-label="Moves">{step.moves < 0 ? 'Not reached' : `Moves so far: ${step.moves}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each letter teleports at most once along a route, so the search state holds the cell and the set of letters already used.</p>
  </>} />
}
