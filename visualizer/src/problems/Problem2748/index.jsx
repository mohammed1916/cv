import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty counts', description: 'No first digits recorded yet.' },
    { id: 'pair', label: 'Count pairs', description: 'Add the earlier first digits that pair with this last digit.' },
    { id: 'record', label: 'Record digit', description: 'Record this number’s first digit for later numbers.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON list of positive integers)',
  url: 'https://leetcode.com/problems/number-of-beautiful-pairs/',
  complexity: 'O(n * 9) time with ten digit counters. The visualization caps input at 10 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,5,1,4]}' },
    { label: 'Two-digit', input: '{"nums":[11,21,12]}' },
  ],
}

export default function NumberOfBeautifulPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="First digit counts">
      <thead><tr>{step.seen.map((_, d) => <th key={d}>{d}</th>)}</tr></thead>
      <tbody><tr>{step.seen.map((count, d) => <td key={d}>{count}</td>)}</tr></tbody>
    </table>
    <output aria-label="Pairs">{`${step.message} Total ${step.total}.`}</output>
  </>} renderReasoning={() => <>
    <p>Only the first digit of earlier numbers and the last digit of the current number matter, so ten counters are enough.</p>
    <p>Each new number is checked against the nine possible first digits, and the counts of the coprime ones are added at once.</p>
  </>} />
}
