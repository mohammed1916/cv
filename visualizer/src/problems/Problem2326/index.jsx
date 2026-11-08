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
    { label: 'Own case 1', input: '{"m":4,"n":6,"head":[4,1,3,7,9,2,8,10,5,3,6,6,1]}' },
    { label: 'Short list', input: '{"m":1,"n":4,"head":[1,2]}' },
    { label: 'One cell', input: '{"m":1,"n":1,"head":[5]}' },
    { label: 'Equal values along the spiral', input: '{"m":2,"n":2,"head":[0,0,0,0]}' },
    { label: 'Largest grid, 20 values', input: '{"m":6,"n":6,"head":[0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95]}' },
    { label: 'Long run: 5 by 6 spiral', input: '{"m":5,"n":6,"head":[13,25,45,76,58,79,93,61,77,20,16,61,79,81,9,65,94,66,89,29]}' },
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
