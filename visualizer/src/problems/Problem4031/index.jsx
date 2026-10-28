import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
    { label: 'Example 1', input: '{"nums":[3,9,7],"lower":1,"upper":12}' },
    { label: 'Example 2', input: '{"nums":[1,1],"lower":5,"upper":7}' },
  ],
}

export default function MissingRangesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Missing ranges">
      <thead><tr><th>Start</th><th>End</th></tr></thead>
      <tbody>{step.ranges.map(([a, b]) => <tr key={`${a}-${b}`}><td>{a}</td><td>{b}</td></tr>)}</tbody>
      <caption>{`Values checked in [${run.input.lower}, ${run.input.upper}]: current ${step.v ?? 'none'}`}</caption>
    </table>
  </>} renderReasoning={() => <>
    <p>A value is missing when it is in the range and absent from nums. Consecutive missing values form one range.</p>
    <p>The range opens at the first missing value and closes at the first present value after it.</p>
  </>} />
}
