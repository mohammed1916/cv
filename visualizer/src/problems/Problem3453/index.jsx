import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'The answer line lies between the lowest square bottom and the highest square top.' },
    { id: 'probe', label: 'Probe', description: 'Test the middle line and keep the half of the range that contains the split.' },
    { id: 'done', label: 'Complete', description: 'Report the separating line.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with squares, each [x, y, l] (JSON)',
  url: 'https://leetcode.com/problems/separate-squares-i/',
  complexity: 'O(n * iterations) time with a fixed number of bisection steps. The visualization caps input at 6 squares.',
  examples: [
    { label: 'Invented two squares', input: '{"squares":[[0,0,3],[4,2,1]]}' },
    { label: 'One large square', input: '{"squares":[[0,0,2]]}' },
    { label: 'Invented three squares', input: '{"squares":[[1,0,2],[2,3,1],[0,5,3]]}' },
  ],
}

export default function SeparateSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Squares">
      <thead><tr><th>x</th><th>y (bottom)</th><th>side</th><th>top</th></tr></thead>
      <tbody>{run.input.squares.map(([x, y, l], i) => <tr key={i}><td>{x}</td><td>{y}</td><td>{l}</td><td>{y + l}</td></tr>)}</tbody>
    </table>
    <AnswerRangeBar title="Line height search" min={run.low0} max={run.high0} low={step.low} high={step.high}
      probe={step.mid} verdict={step.phase === 'probe' ? !step.goLow : null} />
    <output aria-label="Bisection">{step.mid === null ? `lo ${step.low}, hi ${step.high}` : step.phase === 'done' ? `Answer y = ${step.mid.toFixed(4)}` : `Tested y = ${step.mid.toFixed(4)}: area below ${step.below.toFixed(4)} of ${step.half}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A square of side l contributes width l times the height of its part below the line, capped at l. The area below rises as the line rises, so bisection on the line height works.</p>
  </>} />
}
