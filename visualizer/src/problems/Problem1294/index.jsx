import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Countries and weather readings as JSON',
  url: 'https://leetcode.com/problems/weather-type-in-each-country/',
  complexity: 'Knowledge-derived walkthrough: one filter pass, one average per country, and one label per country.',
  examples: [{ label: 'Sample readings', input: JSON.stringify(sample) }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function WeatherTypeInEachCountry() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Readings and labels</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The readings are invented.</p>
    <p>Only November 2019 readings are averaged, so a reading from another month never changes a country’s label.</p>
    <p>A country with no November readings does not appear in the result at all.</p>
  </>} />
}
