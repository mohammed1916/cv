import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix (JSON object with matrix)',
  url: 'https://leetcode.com/problems/lucky-numbers-in-a-matrix/',
  complexity: 'O(m·n) time and O(m + n) space. The visualization accepts up to 10 by 10 matrices.',
  examples: [
    { label: 'Lucky 15', input: '{"matrix":[[3,7,8],[9,11,13],[15,16,17]]}' },
    { label: 'Lucky 3', input: '{"matrix":[[1,2],[3,4]]}' },
    { label: 'None', input: '{"matrix":[[1,4],[3,2]]}' },
  ],
}

export default function LuckyNumbersInMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cell = step.snapshot.cell
    return <>
      <table aria-label="Matrix" className="algorithm-matrix">
        <tbody>{run.input.matrix.map((row, i) => <tr key={i}>
          {row.map((value, j) => {
            const current = cell && cell[0] === i && cell[1] === j
            const lucky = step.snapshot.lucky.includes(value) && step.snapshot.rowMin[i] === value && step.snapshot.colMax[j] === value
            return <td key={j} data-role={current ? (step.snapshot.isLucky ? 'lucky' : 'current') : lucky ? 'lucky' : undefined}
              title={`row ${i} minimum ${step.snapshot.rowMin[i] ?? '?'}, column ${j} maximum ${step.snapshot.colMax[j] ?? '?'}`}>{value}</td>
          })}
          <th scope="row">{step.snapshot.rowMin[i] ?? '·'}</th>
        </tr>)}</tbody>
        <tfoot><tr>{step.snapshot.colMax.map((v, j) => <th key={j} scope="col">{v}</th>)}</tr></tfoot>
      </table>
      <p>Row minima sit on the right; column maxima sit underneath. Lucky values: {step.snapshot.lucky.join(', ') || 'none yet'}.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A cell can be lucky only if it is the smallest value in its row and the largest value in its column. Distinct values make the lucky test unambiguous.</p>
  </>} />
}
