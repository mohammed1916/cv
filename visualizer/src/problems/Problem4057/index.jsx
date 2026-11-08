import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort starts', description: 'Sort every start value once.' },
    { id: 'count', label: 'Disjoint count', description: 'Count the intervals that begin after this one ends.' },
    { id: 'done', label: 'Complete', description: 'Subtract disjoint pairs from all pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Intervals (JSON object with intervals)',
  url: 'https://leetcode.com/problems/number-of-intersecting-interval-pairs-ii/',
  complexity: 'O(n log n) time and O(n) space. The visualization caps input at 12 intervals.',
  examples: [
    { label: 'Example 1', input: '{"intervals":[[1,2],[2,3],[3,4]]}' },
    { label: 'Example 2', input: '{"intervals":[[1,5],[2,4],[3,6]]}' },
    { label: "Identical intervals", input: "{\"intervals\":[[7,7],[7,7]]}" },
    { label: "Touching endpoints", input: "{\"intervals\":[[0,5],[5,9]]}" },
    { label: "Largest endpoints", input: "{\"intervals\":[[0,1000000000],[999999999,1000000000]]}" },
    { label: "Long run: twelve intervals", input: "{\"intervals\":[[91192986,978775881],[687519773,770936711],[996282891,998406863],[256918647,791960163],[610313232,777884720],[295301567,649017316],[105869195,474172595],[414514260,424951430],[503740507,532528934],[241004791,652607591],[344109055,664319905],[262128728,421386460]]}" },
  ],
}

export default function DisjointIntervalPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const starts = run.input.intervals.map(([s]) => s).sort((a, b) => a - b)
    const boundary = step.k === null || step.k === undefined ? -1 : starts.length - step.k
    const endNow = step.index >= 0 ? run.input.intervals[step.index][1] : null
    return <>
      <table aria-label="Intervals">
        <tbody>{run.input.intervals.map(([s, e], i) => <tr key={i} data-active={i === step.index ? 'true' : undefined}>
          <td>{i}</td><td>{`[${s}, ${e}]`}</td>
        </tr>)}</tbody>
      </table>
      <IndexedSequence label={`Sorted starts${endNow === null ? '' : ` — interval ${step.index} ends at ${endNow}`}`} length={starts.length}
        valueAt={i => starts[i]} active={boundary >= 0 && boundary < starts.length ? boundary : -1}
        roleAt={i => (boundary >= 0 && i >= boundary ? 'after end' : boundary >= 0 ? 'not after' : '')} />
      <output aria-label="Disjoint">{`Disjoint pairs so far: ${step.disjoint}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two intervals are disjoint when one ends before the other starts. Each disjoint pair has exactly one such order.</p>
    <p>Counting starts above each end and subtracting from n(n − 1) / 2 gives the intersecting pairs.</p>
  </>} />
}
