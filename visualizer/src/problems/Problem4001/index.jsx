import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'stamp', label: 'Timestamp', description: 'Pick the next timestamp and read each series at or after it.' },
    { id: 'done', label: 'Complete', description: 'Report the aggregated series.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two series (JSON object with series1 and series2)',
  url: 'https://leetcode.com/problems/aggregate-two-time-series/',
  complexity: 'O(n + m) after sorting the timestamps. The visualization caps each series at 8 entries.',
  examples: [
    { label: 'Example 1', input: '{"series1":[[1,3],[4,1]],"series2":[[2,2],[5,2]]}' },
    { label: 'Example 3', input: '{"series1":[[1,5]],"series2":[[1000000000,2]]}' },
  ],
}

export default function AggregateTwoTimeSeries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <table aria-label="Aggregated series">
    <thead><tr><th>Timestamp</th><th>Sum</th></tr></thead>
    <tbody>{step.result.map(([t, sum]) => <tr key={t}><td>{t}</td><td>{sum}</td></tr>)}</tbody>
    <caption>{`${run.input.series1.length} + ${run.input.series2.length} input entries`}</caption>
  </table>} renderReasoning={() => <>
    <p>Both series are sorted, so two pointers can walk through the timestamps once.</p>
    <p>A missing timestamp takes the value of the next later entry in that series, and 0 once a series has no later entry.</p>
  </>} />
}
