import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the start city with all of the fuel.' },
    { id: 'visit', label: 'Visit', description: 'Count routes from a city with some fuel left.' },
    { id: 'reuse', label: 'Memo hit', description: 'Reuse a stored count for the same city and fuel.' },
    { id: 'store', label: 'Store', description: 'Save the count for this city and fuel.' },
    { id: 'done', label: 'Complete', description: 'Report the number of routes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with locations, start, finish, fuel',
  url: 'https://leetcode.com/problems/count-all-possible-routes/',
  complexity: 'O(n^2 * fuel) time and O(n * fuel) memory. The visualization caps input at 8 cities and 20 fuel.',
  examples: [
    { label: 'Example 1', input: '{"locations":[2,3,6,8,4],"start":1,"finish":3,"fuel":5}' },
    { label: 'Example 2', input: '{"locations":[4,3,1],"start":1,"finish":0,"fuel":6}' },
  ],
}

export default function CountAllPossibleRoutes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { locations, start, finish } = run.input
    return <>
      <IndexedSequence label="Locations" length={locations.length} valueAt={i => locations[i]} active={step.city ?? -1}
        roleAt={i => (i === start ? 'start' : i === finish ? 'finish' : '')} />
      <table aria-label="Memo table">
        <thead><tr><th>City</th><th>Fuel left</th><th>Routes</th></tr></thead>
        <tbody>{step.memo.map(e => <tr key={`${e.city}:${e.fuel}`}><td>{e.city}</td><td>{e.fuel}</td><td>{e.value}</td></tr>)}</tbody>
      </table>
      <output aria-label="Current call">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>A route may pass through the finish and keep going, so every visit to the finish counts once.</p>
    <p>The number of routes from a city with some fuel does not depend on how the city was reached, so each (city, fuel) pair is computed once.</p>
  </>} />
}
