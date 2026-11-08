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
    { label: 'Five cities, fuel 18', input: '{"locations":[12,6,20,9,15],"start":0,"finish":3,"fuel":18}' },
    { label: 'Three cities, backwards trip', input: '{"locations":[8,30,11],"start":1,"finish":0,"fuel":9}' },
    { label: 'Two stops, no fuel', input: '{"locations":[4,9],"start":0,"finish":1,"fuel":0}' },
    { label: 'Start is finish', input: '{"locations":[3,7,5],"start":2,"finish":2,"fuel":4}' },
    { label: 'Largest: 8 locations, fuel 20', input: '{"locations":[1000,1,999,2,998,3,997,4],"start":0,"finish":7,"fuel":20}' },
    { label: 'Long run: 8 locations', input: '{"locations":[826,500,742,888,548,920,859,354],"start":0,"finish":5,"fuel":12}' },
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
