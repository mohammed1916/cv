import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'No commas counted yet.' },
    { id: 'group', label: 'Group', description: 'Count the numbers that gain a comma here.' },
    { id: 'done', label: 'Result', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n',
  url: 'https://leetcode.com/problems/count-commas-in-range/',
  complexity: 'Only a handful of thresholds exist, so the count is O(log n) in the number of digits. The visual caps n at 100000.',
  examples: [
    { label: 'Example', input: '{"n":12345}' },
    { label: 'Upper range', input: '{"n":99999}' },
  ],
}

export default function CountCommasInRange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Comma thresholds">
      <thead><tr><th scope="col">Threshold</th><th scope="col">Numbers gaining a comma</th></tr></thead>
      <tbody>{[1000, 1000000, 1000000000].filter(t => t <= run.input.n).map(t =>
        <tr key={t} data-role={step.group === t ? 'target' : ''}><th scope="row">{t.toLocaleString('en-US')}</th><td>{run.input.n - t + 1}</td></tr>)}</tbody>
    </table>
    <output aria-label="Comma total">{`Commas so far: ${step.commas}`}</output>
  </>} renderReasoning={() => <>
    <p>A number has a comma for each thousand group above its first three digits. So every number from 1,000 up gets one, every number from 1,000,000 up gets a second, and so on.</p>
    <p>Each threshold therefore contributes n minus the threshold plus one.</p>
  </>} />
}
