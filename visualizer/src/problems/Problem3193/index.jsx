import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty prefix has one arrangement.' },
    { id: 'position', label: 'Add position', description: 'Each new position adds 0 up to i inversions.' },
    { id: 'done', label: 'Complete', description: 'Sum the arrangements that survived.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 2-7, "requirements": [[end, count], ...]}',
  url: 'https://leetcode.com/problems/count-the-number-of-inversions/',
  complexity: 'O(n^3) time for this table-based DP with n up to 7 in the visualization; the prefix-sum version is O(n^2 * max inversions).',
  examples: [
    { label: 'Example 1', input: '{"n":3,"requirements":[[2,2],[0,0]]}' },
    { label: 'Example 2', input: '{"n":3,"requirements":[[2,2],[1,1],[0,0]]}' },
  ],
}

export default function CountInversions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const cols = Math.max(1, step.row.length)
    return <>
      <p>{step.message}</p>
      <table aria-label="Arrangements by inversion count">
        <thead><tr><th>Inversions</th>{Array.from({ length: cols }, (_, j) => <th key={j} data-role={step.need === j ? 'required' : ''}>{j}</th>)}</tr></thead>
        <tbody><tr><th>Arrangements</th>{step.row.map((w, j) => <td key={j} data-role={step.need === j ? 'required' : ''}>{w}</td>)}</tr></tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p>Building a permutation left to right, a new value can be larger than all but k earlier values, which adds exactly k inversions for k from 0 to i.</p>
    <p>A requirement on a prefix keeps only the counts that match it, so the table after the last position counts the valid permutations.</p>
  </>} />
}
