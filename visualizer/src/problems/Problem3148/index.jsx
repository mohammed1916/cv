import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the scan with no score yet.' },
    { id: 'cell', label: 'Cell', description: 'Find the smallest earlier value that can reach this cell.' },
    { id: 'score', label: 'Score', description: 'Score a path that starts at that smallest value.' },
    { id: 'store', label: 'Store', description: 'Remember the smallest value that covers this cell.' },
    { id: 'done', label: 'Result', description: 'The best score over all cells.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON grid of integers from 1 to 100, up to 6 by 6, at least two cells',
  url: 'https://leetcode.com/problems/maximum-difference-score-in-a-grid/',
  complexity: 'O(m * n) time and space.',
  examples: [
    { label: 'Example 1', input: '[[9,5,7,3],[8,9,6,1],[6,7,14,3],[2,5,3,1]]' },
    { label: 'Example 2', input: '[[4,3,2],[3,2,1]]' },
  ],
}

export default function MaximumDifferenceScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <div className="algorithm-workspace__matrices">
      <MatrixGrid matrix={run.input} label="Grid values" activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} cellWidth={48} cellHeight={44} />
      <MatrixGrid matrix={(step.mn ?? run.input).map(row => row.map(v => (v === Infinity ? '∞' : v)))} label="Smallest value that reaches each cell" tone="muted"
        activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} cellWidth={48} cellHeight={44} />
    </div>
    <output aria-label="Current cell">{step.cell ? `cell (${step.cell[0]}, ${step.cell[1]}) = ${run.input[step.cell[0]][step.cell[1]]}, smallest earlier ${step.prev === Infinity ? 'none' : step.prev}` : 'Scan starts at the top-left cell.'}</output>
    <output aria-label="Best score">{`best score: ${step.best === -Infinity ? 'none' : step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A path's score is its last value minus its first value, because each step adds the difference of neighboring cells. For each cell, the best path ending there starts at the smallest value that can reach it.</p>
    <p>Keeping the smallest value seen over each top-left region gives that starting value in constant time per cell.</p>
  </>} />
}
