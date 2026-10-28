import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'With no events, every count is worth 0.' },
    { id: 'cell', label: 'Skip or attend', description: 'Compare skipping the event with attending it.' },
    { id: 'done', label: 'Complete', description: 'Report the best value for at most k events.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with events [[start, end, value], ...] and k',
  url: 'https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended-ii/',
  complexity: 'O(n * k) table cells after an O(n log n) sort. The visualization caps input at 8 events.',
  examples: [
    { label: 'Example 1', input: '{"events":[[1,2,4],[3,4,3],[2,3,1]],"k":2}' },
    { label: 'Example 2', input: '{"events":[[1,1,1],[2,2,2],[3,3,3],[4,4,4]],"k":3}' },
  ],
}

export default function MaxEventsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="dp table of best values">
      <caption>dp[i][j]: best value using the first i events (sorted by end) with at most j attended</caption>
      <thead><tr><th scope="col">i \ j</th>{Array.from({ length: run.input.k + 1 }, (_, j) => <th scope="col" key={j}>{j}</th>)}</tr></thead>
      <tbody>{step.table.map((row, i) => <tr key={i} data-current={i === step.i ? 'true' : undefined}>
        <th scope="row">{i === 0 ? '0 (none)' : `${i} ${step.events[i - 1].join('-')}`}</th>
        {row.map((value, j) => <td key={j} data-role={i === step.i && j === step.j ? 'current' : undefined}>{value}</td>)}
      </tr>)}</tbody>
    </table>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Sorting by end day lets each event look back to the last event that ends before it starts.</p>
    <p>Two events conflict when one starts on or before the other ends, so an attended event must start after the previous one ends.</p>
  </>} />
}
