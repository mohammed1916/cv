import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the all-unit-squares tiling as the best so far.' },
    { id: 'place', label: 'Place square', description: 'Cover the first empty cell with a square of one size.' },
    { id: 'improve', label: 'New best', description: 'Every cell is covered with fewer squares than before.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest squares found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"n": rows, "m": columns}',
  url: 'https://leetcode.com/problems/tiling-a-rectangle-with-the-fewest-squares/',
  complexity: 'Backtracking over square sizes at the first empty cell, pruned by the best count. The visualization caps the rectangle at 8 by 8.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"m":3}' },
    { label: 'Example 2', input: '{"n":5,"m":8}' },
  ],
}

export default function TilingFewestSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid matrix={step.grid} label="Tiling (numbers are square ids, 0 is empty)" cellWidth={40} cellHeight={40} />
    <output aria-label="Count">{`Squares placed: ${step.placed}; best so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The first empty cell in reading order must be the corner of some square, so the search only chooses that square's size.</p>
    <p>If one more square would already match the best count, that size is skipped because it cannot lead to a better tiling.</p>
  </>} />
}
