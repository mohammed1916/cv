import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DisjointSetView from '../../components/shared/DisjointSetView'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every cell begins as its own set.' },
    { id: 'join', label: 'Join', description: 'Merge two neighbouring cells with the same letter.' },
    { id: 'cycle', label: 'Cycle', description: 'The two cells were already connected, so a loop exists.' },
    { id: 'done', label: 'Complete', description: 'Report whether a cycle was found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of lowercase letters as JSON, e.g. {"grid": ["aaaa","aba"]}',
  url: 'https://leetcode.com/problems/detect-cycles-in-2d-grid/',
  complexity: 'O(m * n * alpha) time with union by size and path halving. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid": ["aaaa","abba","abba","aaaa"]}' },
    { label: 'Example 2', input: '{"grid": ["abb","bzb","bba"]}' },
  ],
}

export default function DetectCyclesGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cols = run.input.grid[0].length
    const names = run.input.grid.flatMap((row, r) => [...row].map((_, c) => `(${r},${c})`))
    const letters = run.input.grid.map(row => [...row])
    const highlighted = step.pair ? step.pair.map(i => ({ row: Math.floor(i / cols), col: i % cols })) : []
    return <>
      <MatrixGrid matrix={letters} label="Letters" highlightedCells={highlighted} />
      <DisjointSetView parent={step.parent} size={step.size} labels={names} />
      <output aria-label="Step result">{step.message}</output>
    </>
  }} renderReasoning={() => (
    <>
      <p>Two neighbouring cells that already belong to one set are linked by a second route of equal letters, and that route plus the new edge forms a cycle.</p>
      <p>Joining neighbours only when they hold the same letter keeps each set a connected region of one letter, so the first closing join decides the answer.</p>
    </>
  )} />
}
