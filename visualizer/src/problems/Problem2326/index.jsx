import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a matrix of minus ones and the outer ring as the boundary.' },
    { id: 'fill', label: 'Write', description: 'Write the next list value along the spiral.' },
    { id: 'ring', label: 'Next ring', description: 'Move every boundary inward by one.' },
    { id: 'done', label: 'Complete', description: 'Return the filled matrix.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"m": rows, "n": columns, "head": [...]}',
  url: 'https://leetcode.com/problems/spiral-matrix-iv/',
  complexity: 'Each cell is written once: O(m n) time. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"m":3,"n":5,"head":[3,0,2,6,8,1,7,9,4,2,5,5,0]}' },
    { label: 'Short list', input: '{"m":1,"n":4,"head":[1,2]}' },
  ],
}

export default function SpiralMatrixIV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid matrix={step.matrix} label="Spiral" activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} cellWidth={44} cellHeight={40} />
    <output aria-label="Cell">{step.cell ? `Writing row ${step.cell[0]}, column ${step.cell[1]}` : 'Between rings'}</output>
  </>} renderReasoning={() => <>
    <p>The spiral is just the outer ring, then the next ring inward, each walked clockwise.</p>
    <p>Each ring is four edges with shrinking boundaries, so the list fills the matrix in one pass.</p>
  </>} />
}
