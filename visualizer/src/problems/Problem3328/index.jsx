import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const sample = '{"Cities":[{"state":"TX","city":"Austin"},{"state":"TX","city":"Dallas"},{"state":"TX","city":"Abilene"},{"state":"OH","city":"Akron"},{"state":"OH","city":"Toledo"},{"state":"CA","city":"Fresno"},{"state":"CA","city":"Davis"},{"state":"CA","city":"Ojai"},{"state":"CA","city":"Azusa"}]}'
const small = '{"Cities":[{"state":"NV","city":"Reno"},{"state":"NV","city":"Elko"},{"state":"ME","city":"Bangor"}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with Cities rows (state as two uppercase letters, city name)',
  url: 'https://leetcode.com/problems/find-cities-in-each-state-ii/description/',
  complexity: 'O(c log c) for c cities, dominated by sorting each state. The visualization caps the table at 12 cities.',
  examples: [
    { label: 'Three states', input: sample },
    { label: 'Too few cities', input: small },
  ],
}

function RowsTable({ columns, rows, caption }) {
  return <table aria-label={caption}>
    <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{rows.length
      ? rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>)
      : <tr><td colSpan={columns.length}>No rows yet</td></tr>}</tbody>
  </table>
}

export default function FindCitiesInEachStateII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RowsTable caption="Qualifying states so far" columns={['state', 'cities']} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} state row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={() => <>
    <p>Cities are grouped by state. HAVING keeps only states with at least three cities, which is applied to the group rather than to single rows.</p>
    <p>Sorting the names before joining makes the list order stable and easy to check.</p>
  </>} />
}
