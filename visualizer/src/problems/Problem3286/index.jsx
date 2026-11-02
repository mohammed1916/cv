import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top left corner.' },
    { id: 'pop', label: 'Visit', description: 'Take the next cell from the deque.' },
    { id: 'relax', label: 'Relax', description: 'A cheaper route to a neighbor was found.' },
    { id: 'done', label: 'Result', description: 'Compare the target cost with health.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (rows of 0 and 1) and health',
  url: 'https://leetcode.com/problems/find-a-safe-walk-through-a-grid/',
  complexity: 'O(m * n) time and space, since every edge costs 0 or 1 and a deque handles both.',
  examples: [
    { label: 'Example', input: '{"grid":[[0,1,0,0,0],[0,1,0,1,0],[0,0,0,1,0]],"health":1}' },
    { label: 'Too costly', input: '{"grid":[[1,1,1],[1,0,1],[1,1,1]],"health":3}' },
  ],
}

export default function FindASafeWalkThroughAGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid" matrix={run.input.grid} activeCell={step.at ? { row: step.at[0], col: step.at[1] } : null} />
    <output aria-label="Walk cost">{`${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Each unsafe cell costs one health, so the cost of a route is the number of 1 cells on it.</p>
    <p>Because every step costs 0 or 1, a deque gives shortest costs: safe steps go to the front, unsafe steps to the back.</p>
  </>} />
}
