import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1307',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words and result (JSON)',
  url: 'https://leetcode.com/problems/verbal-arithmetic-puzzle/',
  complexity: 'Backtracking over at most 5 letters: up to 10 × 9 × 8 × 7 × 6 digit choices in the worst case.',
  examples: [
    { label: 'Solvable', input: '{"words":["BE","BE"],"result":"ME"}' },
    { label: 'Three letters', input: '{"words":["AB"],"result":"BA"}' },
    { label: 'Unsolvable', input: '{"words":["AB","AB"],"result":"CC"}' },
  ],
}

export default function VerbalArithmetic() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { letters, weight, digit } = step.snapshot
    return <>
      <table aria-label="Letter weights and digits" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th>Letter</th>{letters.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          <tr><th>Weight</th>{letters.map(c => <td key={c} style={{ padding: 4 }}>{weight[c]}</td>)}</tr>
          <tr><th>Digit</th>{letters.map(c => <td key={c} data-letter={c} style={{ padding: 4, border: '1px solid var(--border)' }}>{digit[c] ?? '·'}</td>)}</tr>
        </tbody>
      </table>
      <p>{step.snapshot.leading.length ? `Leading letters: ${step.snapshot.leading.join(', ')}` : 'No leading-zero restriction applies.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Weights:</strong> a letter's weight is its place values in the words minus its place values in the result. The sum is zero exactly when the words add up.</p>
    <p><strong>Search:</strong> assign digits letter by letter, never reuse a digit, and back up when the weighted sum fails.</p>
  </>} />
}
