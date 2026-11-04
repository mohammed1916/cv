import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Example 1', input: '{"series1":[[3,2],[6,4]],"series2":[[1,1],[6,3]]}' },
    { label: 'Example 3', input: '{"series1":[[2,5],[7,1]],"series2":[[7,4]]}' },
  ],
}

// The entry each series contributes at timestamp t: the first entry at or after t, or none once the series has ended.
function pointerFor(series, t) {
  if (t === null || t === undefined) return -1
  return series.findIndex(([stamp]) => stamp >= t)
}

function SeriesRow({ label, series, t, pointerRole }) {
  const pointer = pointerFor(series, t)
  return <IndexedSequence label={label} length={series.length} active={pointer}
    valueAt={index => `${series[index][0]}: ${series[index][1]}`}
    roleAt={index => index === pointer ? `${pointerRole} · ${series[index][0] === t ? 'exact match' : 'next later entry'}` : index < pointer || (pointer < 0 && t !== null && series[index][0] < t) ? 'passed' : ''} />
}

export default function AggregateTwoTimeSeries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SeriesRow label="series1 (timestamp: value); l is its pointer" series={run.input.series1} t={step.t} pointerRole="l" />
    <SeriesRow label="series2 (timestamp: value); r is its pointer" series={run.input.series2} t={step.t} pointerRole="r" />
    <table aria-label="Aggregated series">
      <thead><tr><th>Timestamp</th><th>Sum</th></tr></thead>
      <tbody>{step.result.map(([t, sum]) => <tr key={t}><td>{t}</td><td>{sum}</td></tr>)}</tbody>
      <caption>{`${run.input.series1.length} + ${run.input.series2.length} input entries`}</caption>
    </table>
    {step.t !== null && step.t !== undefined && <output aria-label="Current timestamp">{`Timestamp ${step.t}: series 1 contributes ${step.v1}, series 2 contributes ${step.v2}`}</output>}
  </>} renderReasoning={() => <>
    <p>Both series are sorted, so two pointers can walk through the timestamps once.</p>
    <p>A missing timestamp takes the value of the next later entry in that series, and 0 once a series has no later entry.</p>
  </>} />
}
