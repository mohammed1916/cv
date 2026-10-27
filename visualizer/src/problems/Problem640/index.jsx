import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'split', label: 'Split sides', description: 'Sum the x-coefficients and constants on each side.' },
    { id: 'move', label: 'Move terms', description: 'Collect x on the left and constants on the right.' },
    { id: 'done', label: 'Complete', description: 'Solve, or detect no or infinite solutions.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Equation (JSON string)',
  url: 'https://leetcode.com/problems/solve-the-equation/',
  complexity: 'O(n) time and O(1) extra space for the equation length n.',
  examples: [
    { label: 'Unique', input: '"x+5-3+x=6+x-2"' },
    { label: 'No solution', input: '"x=x+2"' },
    { label: 'Infinite', input: '"2x=x+x"' },
  ],
}

export default function SolveEquation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Equation terms">
      <thead><tr><th /><th>x coefficient</th><th>constant</th></tr></thead>
      <tbody>
        <tr><th>left</th><td>{step.left.coefficient}</td><td>{step.left.constant}</td></tr>
        <tr><th>right</th><td>{step.right.coefficient}</td><td>{step.right.constant}</td></tr>
        {step.a !== null && step.a !== undefined && <tr><th>a x = b</th><td>{step.a}</td><td>{step.b}</td></tr>}
      </tbody>
    </table>
    <output aria-label="Solution">{step.phase === 'done' ? step.result : `Equation: ${run.input}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Three outcomes:</strong> a ≠ 0 gives one solution; a = 0 with b ≠ 0 has none; a = 0 and b = 0 means every x works.</p>
  </>} />
}
