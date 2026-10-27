import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Split', description: 'Split the date into year, month and day.' },
    { id: 'year', label: 'Year', description: 'Convert the year to binary.' },
    { id: 'month', label: 'Month', description: 'Convert the month to binary without a leading zero.' },
    { id: 'day', label: 'Day', description: 'Convert the day to binary.' },
    { id: 'done', label: 'Complete', description: 'Join the three parts with dashes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Date as JSON: {"date": "yyyy-mm-dd"}',
  url: 'https://leetcode.com/problems/convert-date-to-binary/',
  complexity: 'O(1) time, since each field has at most 12 binary digits.',
  examples: [
    { label: 'Example 1', input: '{"date":"2080-02-29"}' },
    { label: 'New year', input: '{"date":"1900-01-01"}' },
  ],
}

export default function ConvertDateToBinary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Date parts">
      <thead><tr><th>Part</th><th>Decimal</th><th>Binary</th></tr></thead>
      <tbody>{step.parts.map(part => (
        <tr key={part.label}><td>{part.label}</td><td>{part.decimal}</td><td><code>{part.binary}</code></td></tr>
      ))}</tbody>
    </table>
    <output aria-label="Joined result">{step.parts.length === 3 ? step.parts.map(p => p.binary).join('-') : 'Parts are still being converted'}</output>
  </>} renderReasoning={() => <>
    <p>The three fields are independent, so each one is converted on its own, dropping leading zeros.</p>
    <p>Joining the parts with dashes gives the required format.</p>
  </>} />
}
