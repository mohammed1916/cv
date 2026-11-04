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
  ],
}

export default function ReshapeDataPivot() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PivotView run={run} step={step} />} renderReasoning={() => <>
    <p>Each input row already states three facts: which month, which city and what temperature. A pivot gives each fact a job. The month chooses the table row, the city chooses the column and the temperature fills the cell.</p>
    <p>Labels come out in text order, not calendar order, so August comes before July. A month and city pair with no input row stays missing rather than becoming zero.</p>
    <p>In pandas the whole reshape is <code>weather.pivot(index='month', columns='city', values='temperature')</code>. The code panel spells out what that call does so each step can be followed.</p>
  </>} />
}
