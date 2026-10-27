import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Start with the lowest and highest square edges.' },
    { id: 'probe', label: 'Probe', description: 'Test the middle line and keep the half that contains the split.' },
    { id: 'done', label: 'Complete', description: 'Report the separating line.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with squares, each [x, y, l] (JSON)',
  url: 'https://leetcode.com/problems/separate-squares-i/',
  complexity: 'O(n * iterations) time with a fixed number of bisection steps. The visualization caps input at 6 squares.',
  examples: [
    { label: 'Two squares', input: '{"squares":[[0,0,1],[2,2,1]]}' },
    { label: 'One large square', input: '{"squares":[[0,0,2]]}' },
  ],
}

export default function SeparateSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Squares">
      <thead><tr><th>x</th><th>y (bottom)</th><th>side</th></tr></thead>
      <tbody>{run.input.squares.map(([x, y, l], i) => <tr key={i}><td>{x}</td><td>{y}</td><td>{l}</td></tr>)}</tbody>
    </table>
    <output aria-label="Bisection">{step.mid === null ? `Search between ${step.low} and ${step.high}` : `Line y = ${step.mid.toFixed(4)}, area below ${step.below.toFixed(4)}, bracket [${step.low.toFixed(4)}, ${step.high.toFixed(4)}]`}</output>
  </>} renderReasoning={() => <>
    <p>The area below a horizontal line rises steadily as the line rises, so the line that splits the total in half can be found by bisection.</p>
    <p>A square of side l contributes width l times the height of its part below the line, capped at l.</p>
  </>} />
}
