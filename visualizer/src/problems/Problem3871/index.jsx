import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'No commas counted yet.' },
    { id: 'group', label: 'Group', description: 'Count the numbers that gain a comma at this threshold.' },
    { id: 'done', label: 'Result', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (up to 1000000000000000)',
  url: 'https://leetcode.com/problems/count-commas-in-range-ii/',
  complexity: 'Only one step per thousand-group up to n, so the loop runs a handful of times. Arithmetic uses BigInt to stay exact.',
  examples: [
    { label: 'Example', input: '{"n":987654321}' },
    { label: 'Million', input: '{"n":1000000}' },
  ],
}

export default function CountCommasInRangeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Comma groups">
      <thead><tr><th scope="col">Group starts at</th><th scope="col">Numbers gaining a comma</th></tr></thead>
      <tbody>{step.group ? <tr data-role="target"><th scope="row">{Number(step.group).toLocaleString('en-US')}</th><td>{Number(step.added).toLocaleString('en-US')}</td></tr> : null}</tbody>
    </table>
    <output aria-label="Comma total">{`Commas so far: ${Number(step.commas).toLocaleString('en-US')}`}</output>
  </>} renderReasoning={() => <>
    <p>Every number at or above a thousand-group threshold gains one more comma, so each threshold contributes the count of numbers from it up to n.</p>
    <p>The totals can pass the range of ordinary integers in other languages, so the walkthrough uses exact integer arithmetic.</p>
  </>} />
}
