import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PivotView from './PivotView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const row = (city, month, temperature) => ({ city, month, temperature })

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with weather: rows of city, month and temperature',
  url: 'https://leetcode.com/problems/reshape-data-pivot/',
  complexity: 'O(r + m log m + c log c) time and O(m × c) space for r rows, m months and c cities. The visualization caps weather at 30 rows.',
  examples: [
    { label: 'Three months, two cities', input: JSON.stringify({ weather: [
      row('Oslo', 'June', 16), row('Oslo', 'July', 18), row('Oslo', 'August', 17),
      row('Cairo', 'June', 34), row('Cairo', 'July', 36), row('Cairo', 'August', 35),
    ] }) },
    { label: 'Gap: a pair has no row', input: JSON.stringify({ weather: [
      row('Lima', 'Spring', 21), row('Quito', 'Autumn', 14), row('Lima', 'Autumn', 19),
    ] }) },
    { label: 'One row', input: JSON.stringify({ weather: [row('Reykjavik', 'Winter', -3)] }) },
    { label: "Zero degrees", input: "{\"weather\":[{\"city\":\"Oslo\",\"month\":\"May\",\"temperature\":0}]}" },
    { label: "Equal temperatures in one month", input: "{\"weather\":[{\"city\":\"Lima\",\"month\":\"Jan\",\"temperature\":5},{\"city\":\"Perth\",\"month\":\"Jan\",\"temperature\":5}]}" },
    { label: "Maximum rows, 5 cities by 6 months", input: "{\"weather\":[{\"city\":\"Oslo\",\"month\":\"Jan\",\"temperature\":-20},{\"city\":\"Oslo\",\"month\":\"Feb\",\"temperature\":-19},{\"city\":\"Oslo\",\"month\":\"Mar\",\"temperature\":-18},{\"city\":\"Oslo\",\"month\":\"Apr\",\"temperature\":-17},{\"city\":\"Oslo\",\"month\":\"May\",\"temperature\":-16},{\"city\":\"Oslo\",\"month\":\"Jun\",\"temperature\":-15},{\"city\":\"Lima\",\"month\":\"Jan\",\"temperature\":-10},{\"city\":\"Lima\",\"month\":\"Feb\",\"temperature\":-9},{\"city\":\"Lima\",\"month\":\"Mar\",\"temperature\":-8},{\"city\":\"Lima\",\"month\":\"Apr\",\"temperature\":-7},{\"city\":\"Lima\",\"month\":\"May\",\"temperature\":-6},{\"city\":\"Lima\",\"month\":\"Jun\",\"temperature\":-5},{\"city\":\"Cairo\",\"month\":\"Jan\",\"temperature\":0},{\"city\":\"Cairo\",\"month\":\"Feb\",\"temperature\":1},{\"city\":\"Cairo\",\"month\":\"Mar\",\"temperature\":2},{\"city\":\"Cairo\",\"month\":\"Apr\",\"temperature\":3},{\"city\":\"Cairo\",\"month\":\"May\",\"temperature\":4},{\"city\":\"Cairo\",\"month\":\"Jun\",\"temperature\":5},{\"city\":\"Perth\",\"month\":\"Jan\",\"temperature\":10},{\"city\":\"Perth\",\"month\":\"Feb\",\"temperature\":11},{\"city\":\"Perth\",\"month\":\"Mar\",\"temperature\":12},{\"city\":\"Perth\",\"month\":\"Apr\",\"temperature\":13},{\"city\":\"Perth\",\"month\":\"May\",\"temperature\":14},{\"city\":\"Perth\",\"month\":\"Jun\",\"temperature\":15},{\"city\":\"Quito\",\"month\":\"Jan\",\"temperature\":20},{\"city\":\"Quito\",\"month\":\"Feb\",\"temperature\":21},{\"city\":\"Quito\",\"month\":\"Mar\",\"temperature\":22},{\"city\":\"Quito\",\"month\":\"Apr\",\"temperature\":23},{\"city\":\"Quito\",\"month\":\"May\",\"temperature\":24},{\"city\":\"Quito\",\"month\":\"Jun\",\"temperature\":25}]}" },
    { label: "Long run: 30 random rows", input: "{\"weather\":[{\"city\":\"C0\",\"month\":\"M0\",\"temperature\":-5},{\"city\":\"C1\",\"month\":\"M0\",\"temperature\":-8},{\"city\":\"C2\",\"month\":\"M0\",\"temperature\":36},{\"city\":\"C3\",\"month\":\"M0\",\"temperature\":13},{\"city\":\"C4\",\"month\":\"M0\",\"temperature\":27},{\"city\":\"C0\",\"month\":\"M1\",\"temperature\":23},{\"city\":\"C1\",\"month\":\"M1\",\"temperature\":13},{\"city\":\"C2\",\"month\":\"M1\",\"temperature\":-2},{\"city\":\"C3\",\"month\":\"M1\",\"temperature\":-17},{\"city\":\"C4\",\"month\":\"M1\",\"temperature\":9},{\"city\":\"C0\",\"month\":\"M2\",\"temperature\":13},{\"city\":\"C1\",\"month\":\"M2\",\"temperature\":-19},{\"city\":\"C2\",\"month\":\"M2\",\"temperature\":24},{\"city\":\"C3\",\"month\":\"M2\",\"temperature\":18},{\"city\":\"C4\",\"month\":\"M2\",\"temperature\":15},{\"city\":\"C0\",\"month\":\"M3\",\"temperature\":-26},{\"city\":\"C1\",\"month\":\"M3\",\"temperature\":-18},{\"city\":\"C2\",\"month\":\"M3\",\"temperature\":-14},{\"city\":\"C3\",\"month\":\"M3\",\"temperature\":40},{\"city\":\"C4\",\"month\":\"M3\",\"temperature\":9},{\"city\":\"C0\",\"month\":\"M4\",\"temperature\":-25},{\"city\":\"C1\",\"month\":\"M4\",\"temperature\":9},{\"city\":\"C2\",\"month\":\"M4\",\"temperature\":19},{\"city\":\"C3\",\"month\":\"M4\",\"temperature\":-1},{\"city\":\"C4\",\"month\":\"M4\",\"temperature\":-18},{\"city\":\"C0\",\"month\":\"M5\",\"temperature\":16},{\"city\":\"C1\",\"month\":\"M5\",\"temperature\":1},{\"city\":\"C2\",\"month\":\"M5\",\"temperature\":19},{\"city\":\"C3\",\"month\":\"M5\",\"temperature\":-22},{\"city\":\"C4\",\"month\":\"M5\",\"temperature\":8}]}" },
  ],
}

export default function ReshapeDataPivot() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PivotView run={run} step={step} />} renderReasoning={() => <>
    <p>Each input row already states three facts: which month, which city and what temperature. A pivot gives each fact a job. The month chooses the table row, the city chooses the column and the temperature fills the cell.</p>
    <p>Labels come out in text order, not calendar order, so August comes before July. A month and city pair with no input row stays missing rather than becoming zero.</p>
    <p>In pandas the whole reshape is <code>weather.pivot(index='month', columns='city', values='temperature')</code>. The code panel spells out what that call does so each step can be followed.</p>
  </>} />
}
