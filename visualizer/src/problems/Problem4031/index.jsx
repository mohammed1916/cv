import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'missing', label: 'Missing', description: 'This value is absent, so extend or start a range.' },
    { id: 'close', label: 'Close range', description: 'A present value ends the current missing run.' },
    { id: 'present', label: 'Present', description: 'This value is present and no run is open.' },
    { id: 'done', label: 'Complete', description: 'Report all missing ranges.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers and bounds (JSON object with nums, lower and upper)',
  url: 'https://www.talentd.in/fleetcode/videos/find-all-numbers-disappeared-in-an-array-ii',
  complexity: 'O(n + (upper - lower)) time and O(n) space. The visualization caps the range at 61 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,8,4],"lower":1,"upper":10}' },
    { label: 'Example 2', input: '{"nums":[1,1],"lower":5,"upper":7}' },
    { label: "One number, one value", input: "{\"nums\":[5],\"lower\":5,\"upper\":5}" },
    { label: "Repeated values", input: "{\"nums\":[3,3,3],\"lower\":3,\"upper\":3}" },
    { label: "Range at the top limit", input: "{\"nums\":[100000,1,100000],\"lower\":99940,\"upper\":100000}" },
    { label: "Long run: 16 numbers", input: "{\"nums\":[76581,5236,8506,82944,63948,86755,37182,77476,9870,96706,93181,96790,36318,2463,71331,71126],\"lower\":9052,\"upper\":9112}" },
  ],
}

export default function MissingRangesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, lower, upper } = run.input
    const present = new Set(nums)
    const width = upper - lower + 1
    // l is the first missing value of the run being built and r is the value checked now; both are shown on the value strip.
    const v = step.v
    let l = null
    if (v !== null && v !== undefined && !present.has(v)) {
      l = v
      while (l - 1 >= lower && !present.has(l - 1)) l -= 1
    }
    return <>
      {width <= 61 && <IndexedSequence label={`Values ${lower} to ${upper} (l starts the open missing run, r is the value checked)`} length={width}
        active={v === null || v === undefined ? -1 : v - lower} valueAt={i => (present.has(lower + i) ? 'present' : 'missing')}
        roleAt={i => (l !== null && lower + i === l ? 'l' : v !== null && v !== undefined && lower + i === v ? 'r' : '')} />}
      <table aria-label="Missing ranges">
      <thead><tr><th>Start</th><th>End</th></tr></thead>
      <tbody>{step.ranges.map(([a, b]) => <tr key={`${a}-${b}`}><td>{a}</td><td>{b}</td></tr>)}</tbody>
      <caption>{`Values checked in [${run.input.lower}, ${run.input.upper}]: current ${step.v ?? 'none'}`}</caption>
    </table>
    </>
  }} renderReasoning={() => <>
    <p>A value is missing when it is in the range and absent from nums. Consecutive missing values form one range.</p>
    <p>The range opens at the first missing value and closes at the first present value after it.</p>
  </>} />
}
