import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Countries and weather readings as JSON',
  url: 'https://leetcode.com/problems/weather-type-in-each-country/',
  complexity: 'Walkthrough: one filter pass, one average per country, and one label per country.',
  examples: [{ label: 'Sample readings', input: JSON.stringify(sample) }, { label: 'Single reading', input: '{"countries":[{"country_id":1,"country_name":"Peru"}],"weather":[{"country_id":1,"weather_state":20,"day":"2020-01-01"}]}' }, { label: 'Average of 15 and 25', input: '{"countries":[{"country_id":2,"country_name":"Oman"}],"weather":[{"country_id":2,"weather_state":15,"day":"2020-02-01"},{"country_id":2,"weather_state":25,"day":"2020-02-02"}]}' }, { label: 'No countries', input: '{"countries":[],"weather":[]}' }, { label: 'Long run: 8 countries, 32 readings', input: '{"countries":[{"country_id":1,"country_name":"Country 1"},{"country_id":2,"country_name":"Country 2"},{"country_id":3,"country_name":"Country 3"},{"country_id":4,"country_name":"Country 4"},{"country_id":5,"country_name":"Country 5"},{"country_id":6,"country_name":"Country 6"},{"country_id":7,"country_name":"Country 7"},{"country_id":8,"country_name":"Country 8"}],"weather":[{"country_id":1,"weather_state":4,"day":"2021-05-13"},{"country_id":1,"weather_state":17,"day":"2021-07-26"},{"country_id":1,"weather_state":19,"day":"2021-05-24"},{"country_id":1,"weather_state":-5,"day":"2021-03-15"},{"country_id":2,"weather_state":18,"day":"2021-03-20"},{"country_id":2,"weather_state":37,"day":"2021-08-21"},{"country_id":2,"weather_state":10,"day":"2021-06-25"},{"country_id":2,"weather_state":32,"day":"2021-04-26"},{"country_id":3,"weather_state":13,"day":"2021-06-24"},{"country_id":3,"weather_state":21,"day":"2021-06-14"},{"country_id":3,"weather_state":26,"day":"2021-02-21"},{"country_id":3,"weather_state":-4,"day":"2021-04-21"},{"country_id":4,"weather_state":-3,"day":"2021-08-14"},{"country_id":4,"weather_state":23,"day":"2021-03-20"},{"country_id":4,"weather_state":29,"day":"2021-05-26"},{"country_id":4,"weather_state":35,"day":"2021-06-26"},{"country_id":5,"weather_state":15,"day":"2021-09-23"},{"country_id":5,"weather_state":5,"day":"2021-02-13"},{"country_id":5,"weather_state":24,"day":"2021-09-17"},{"country_id":5,"weather_state":35,"day":"2021-01-11"},{"country_id":6,"weather_state":12,"day":"2021-05-10"},{"country_id":6,"weather_state":35,"day":"2021-03-10"},{"country_id":6,"weather_state":4,"day":"2021-02-27"},{"country_id":6,"weather_state":36,"day":"2021-01-13"},{"country_id":7,"weather_state":0,"day":"2021-06-28"},{"country_id":7,"weather_state":7,"day":"2021-06-16"},{"country_id":7,"weather_state":24,"day":"2021-09-16"},{"country_id":7,"weather_state":8,"day":"2021-07-16"},{"country_id":8,"weather_state":1,"day":"2021-04-19"},{"country_id":8,"weather_state":25,"day":"2021-07-17"},{"country_id":8,"weather_state":30,"day":"2021-08-23"},{"country_id":8,"weather_state":15,"day":"2021-05-11"}]}' }],
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
    <p>Walkthrough of the query stages on invented sample rows. The readings are invented.</p>
    <p>Only November 2019 readings are averaged, so a reading from another month never changes a country’s label.</p>
    <p>A country with no November readings does not appear in the result at all.</p>
  </>} />
}
