import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Capital', description: 'Begin at city 0 with no fuel spent.' },
    { id: 'enter', label: 'Enter city', description: 'Each city starts with one representative.' },
    { id: 'charge', label: 'Send cars', description: 'The people from this subtree need ceiling(people / seats) cars.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum fuel.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree as JSON: roads, seats',
  url: 'https://leetcode.com/problems/minimum-fuel-cost-to-report-to-the-capital/',
  complexity: 'O(n) time and O(n) space for the depth-first walk. The visualization caps input at 10 cities.',
  examples: [
    { label: 'Two branches', input: '{"roads":[[1,0],[2,0],[3,2],[4,2]],"seats":3}' },
    { label: 'Star with a long arm', input: '{"roads":[[0,1],[0,2],[0,3],[3,4],[4,5],[4,6]],"seats":4}' },
    { label: 'No roads', input: '{"roads":[],"seats":1}' },
    { label: 'Two equal branches', input: '{"roads":[[0,1],[0,2]],"seats":2}' },
    { label: 'Chain with one seat', input: '{"roads":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]],"seats":1}' },
    { label: 'Long run: 10 cities', input: '{"roads":[[0,1],[1,2],[0,3],[0,4],[0,5],[5,6],[5,7],[6,8],[7,9]],"seats":3}' },
  ],
}

export default function MinimumFuelToCapital() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.roads.length + 1
    return <>
      <GraphTraversalView title="Road tree (capital is 0)" n={n} edges={run.input.roads} current={step.node}
        tags={step.tags} />
      <output aria-label="Fuel">{`Fuel so far: ${step.total}${step.people === null ? '' : `, people at city ${step.node}: ${step.people}`}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every car that drives toward the capital uses one unit of fuel per road, so each road costs the number of cars that cross it.</p>
    <p>A subtree of people can share cars, so the cars on a road are the ceiling of the subtree's people divided by the seats.</p>
  </>} />
}
