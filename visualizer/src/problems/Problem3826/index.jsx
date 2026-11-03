import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3826,
  phases: [
    { id: 'table', label: 'Table', description: 'Start with zero blocks covering zero numbers.' },
    { id: 'cell', label: 'Cell', description: 'Each entry tries every place to start its last block.' },
    { id: 'done', label: 'Result', description: 'The full answer sits in the last cell of the last row.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers 1 to 9) and k',
  url: 'https://leetcode.com/problems/minimum-partition-score/',
  complexity: 'O(k * n^2) time and O(k * n) space; prefix sums make each block cost constant time.',
  examples: [
    { label: 'Two blocks', input: '{"nums":[4,2,3,1],"k":2}' },
    { label: 'One block', input: '{"nums":[1,2,3],"k":1}' },
  ],
}

export default function MinimumPartitionScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Best scores table">
      <caption>Best score with j blocks (rows) over the first i numbers (columns)</caption>
      <thead><tr><th>j \ i</th>{step.dp[0].map((_, i) => <th key={i}>{i}</th>)}</tr></thead>
      <tbody>{step.dp.map((row, j) => <tr key={j}>
        <th>{j}</th>{row.map((v, i) => <td key={i} data-current={step.layer === j && step.end === i ? 'yes' : undefined}>{v === null ? '∞' : v}</td>)}
      </tr>)}</tbody>
    </table>
    <output aria-label="Current cell">{step.message}</output>
    {step.split && <p aria-label="Blocks chosen">Blocks: {step.split.map(b => `[${b.join(', ')}]`).join(' ')}</p>}
  </>} renderReasoning={() => <>
    <p>A block with sum s costs s(s+1)/2, and prefix sums give any block sum at once.</p>
    <p>Each row only depends on the row before it, so the table is filled one block count at a time and the last cell holds the answer.</p>
  </>} />
}
