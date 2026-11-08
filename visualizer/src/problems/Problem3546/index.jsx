import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Add up every cell in the grid.' },
    { id: 'row', label: 'Row cuts', description: 'Try each horizontal cut from the top.' },
    { id: 'col', label: 'Column cuts', description: 'Try each vertical cut from the left.' },
    { id: 'done', label: 'Complete', description: 'Report whether a straight cut balances the sums.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with grid: 1 to 6 rows of 1 to 6 integers from 1 to 6, all rows the same length',
  url: 'https://leetcode.com/problems/equal-sum-grid-partition-i/',
  complexity: 'O(m * n) time. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,4],[2,3]]}' },
    { label: 'Example 2', input: '{"grid":[[1,3],[2,4]]}' },
    { label: 'Two cells', input: '{"grid":[[1,2]]}' },
    { label: 'Equal values', input: '{"grid":[[3,3],[3,3]]}' },
    { label: 'Largest grid', input: '{"grid":[[1,1,1,1,1,1],[1,2,3,4,5,6],[1,3,5,1,3,5],[1,4,1,4,1,4],[1,5,3,1,5,3],[1,6,5,4,3,2]]}' },
    { label: 'Long run: 5 by 6 grid', input: '{"grid":[[1,6,5,2,1,1],[5,6,5,5,2,6],[1,5,3,5,1,1],[6,6,4,3,4,2],[3,6,5,1,2,3]]}' },
  ],
}

export default function EqualSumGridPartitionOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cut = step.cut
    return <>
      <table aria-label="Grid">
        <tbody>{run.input.grid.map((row, r) => <tr key={r}>{row.map((value, c) => {
          const side = !cut ? '' : cut.kind === 'row' ? (r <= cut.index ? 'top' : 'bottom') : (c <= cut.index ? 'left' : 'right')
          const tint = side === 'top' || side === 'left' ? 'var(--primary)' : side === 'bottom' || side === 'right' ? 'var(--accent, var(--surface2))' : 'transparent'
          return <td key={c} data-side={side} style={{ border: '1px solid var(--surface2)', padding: '4px 8px', textAlign: 'center', background: tint, opacity: side ? 0.85 : 1 }}>{value}</td>
        })}</tr>)}</tbody>
      </table>
      <output aria-label="Cut sums">{step.acc === null || step.acc === undefined ? `Total ${step.total}` : `First part ${step.acc}, total ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A straight cut leaves two parts with equal sums only when the first part sums to exactly half the total.</p>
    <p>Row sums and column sums are accumulated from one edge, so each cut is checked as one comparison.</p>
  </>} />
}
