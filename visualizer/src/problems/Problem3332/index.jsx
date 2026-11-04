import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every city starts with 0 points, since the tourist may begin anywhere.' },
    { id: 'day', label: 'Day', description: 'For each city, keep the best stay or travel into it.' },
    { id: 'done', label: 'Complete', description: 'Report the best total over all cities.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tour (JSON object with n, k, stay_score and travel_score)',
  url: 'https://leetcode.com/problems/maximum-points-tourist-can-earn/',
  complexity: 'O(k * n^2) time and O(n) space. The visualization caps n and k at 6.',
  examples: [
    { label: 'Invented three cities, one day', input: '{"n":3,"k":1,"stay_score":[[4,1,2]],"travel_score":[[0,3,1],[2,0,5],[1,2,0]]}' },
    { label: 'Invented two cities, two days', input: '{"n":2,"k":2,"stay_score":[[1,6],[2,3]],"travel_score":[[0,4],[1,0]]}' },
  ],
}

export default function TouristPoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <table aria-label="Best total per city and day">
        <thead>
          <tr>
            <th scope="col">after day</th>
            {Array.from({ length: run.input.n }, (_, c) => <th key={c} scope="col">city {c}</th>)}
          </tr>
        </thead>
        <tbody>
          {step.history.map((row, day) => (
            <tr key={day} style={day === step.history.length - 1 ? { fontWeight: 700 } : undefined}>
              <th scope="row">{day === 0 ? 'start' : day - 1}</th>
              {row.map((value, c) => <td key={c}>{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <output aria-label="Best totals by city">{`Day: ${step.day < 0 ? 'before day 0' : step.day}, best by city: ${step.best.join(', ')}`}</output>
    </>
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>On each day the tourist either stays in the city or travels, so the best total for a city depends only on the best totals from the previous day.</p>
  </>} />
}
