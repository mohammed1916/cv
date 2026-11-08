import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty prefix has total 0 with no subarrays.' },
    { id: 'row', label: 'Extend prefix', description: 'For each count, take the better of skipping this value or ending a subarray here.' },
    { id: 'done', label: 'Return', description: 'Take the best total over all allowed counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"nums": [...], "m": m, "l": l, "r": r}',
  url: 'https://leetcode.com/problems/maximum-sum-of-m-non-overlapping-subarrays-ii/',
  complexity: 'O(n * m * (r - l)) time and O(n * m) space. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"nums":[6,-2,3,-1,5],"m":2,"l":2,"r":3}' },
    { label: 'Example 3', input: '{"nums":[-4,9,-2],"m":1,"l":1,"r":2}' },
    { label: 'Single value', input: '{"nums":[5],"m":1,"l":1,"r":1}' },
    { label: 'Equal values', input: '{"nums":[2,2,2],"m":2,"l":1,"r":3}' },
    { label: 'Full range, extremes', input: '{"nums":[-20,20,-20,20,-20,20,-20,20],"m":8,"l":1,"r":8}' },
    { label: 'Long run: 8 values', input: '{"nums":[5,-2,14,-4,2,19,-20,12],"m":3,"l":2,"r":7}' },
  ],
}

// The count j whose best total in this row is largest; its chosen subarray is the one drawn with l and r.
function bestCount(row) {
  let bestJ = 0
  for (let j = 1; j < row.length; j++) if (row[j] > -Infinity && (bestJ === 0 || row[j] > row[bestJ])) bestJ = j
  return bestJ
}

export default function MaxSumNonOverlappingII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.nums.length
    const top = step.table[0].length - 1
    const cur = step.i
    const j = step.picks && step.picks.length ? bestCount(step.row) : 0
    const start = j > 0 && step.picks[j] >= 0 ? step.picks[j] : -1
    const role = index => {
      if (start < 0) return ''
      if (index === start) return 'l'
      if (index === cur - 1) return 'r'
      return index > start && index < cur - 1 ? 'in subarray' : ''
    }
    return <>
      <IndexedSequence label="nums (l and r bound the subarray behind the best option)" length={n} active={cur > 0 ? cur - 1 : -1}
        valueAt={index => run.input.nums[index]} roleAt={role} />
      <table aria-label="Best totals by prefix length and subarray count">
        <caption>best[i][j]: rows are prefix lengths i, columns are subarray counts j</caption>
        <thead><tr><th>i \ j</th>{Array.from({ length: top }, (_, k) => <th key={k}>{k + 1}</th>)}</tr></thead>
        <tbody>{step.table.map((row, i) => <tr key={i} data-current={i === cur ? 'yes' : undefined}>
          <th>{i}</th>{row.slice(1).map((v, k) => <td key={k} data-chosen={i === cur && k + 1 === j ? 'yes' : undefined}>{v === -Infinity ? '-inf' : v}</td>)}
        </tr>)}</tbody>
      </table>
      <output aria-label="Step message">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each cell asks whether the current value is skipped or ends a subarray whose length is between l and r.</p>
    <p>Tracking the number of subarrays used keeps the at-most-m limit exact, and at least one subarray is required by taking j from 1.</p>
    <p>The l and r pointers mark the subarray that the row's best count chose to end at the current value.</p>
  </>} />
}
