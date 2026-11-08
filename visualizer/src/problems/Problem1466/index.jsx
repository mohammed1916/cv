import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin counting reversals.' },
    { id: 'build', label: 'Build', description: 'Record each road in both directions with its cost.' },
    { id: 'push', label: 'Start search', description: 'Begin at city zero.' },
    { id: 'pop', label: 'Visit city', description: 'Look at the roads of the city just taken from the stack.' },
    { id: 'road', label: 'Road', description: 'Add the cost of an unvisited neighbour.' },
    { id: 'done', label: 'Complete', description: 'Report the number of reversed roads.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Cities and roads as JSON, e.g. {"n": 3, "connections": [[1,0],[1,2]]}',
  url: 'https://leetcode.com/problems/reorder-routes-to-make-all-paths-lead-to-the-city-zero/',
  complexity: 'O(n) time and space, one visit per city.',
  examples: [
    { label: 'Single path of seven', input: '{"n":7,"connections":[[6,2],[2,4],[4,1],[1,5],[5,0],[0,3]]}' },
    { label: 'Path with a detour', input: '{"n":4,"connections":[[0,2],[2,3],[3,1]]}' },
    { label: 'Two cities, one road', input: '{"n":2,"connections":[[0,1]]}' },
    { label: 'Star from one city', input: '{"n":4,"connections":[[0,1],[0,2],[0,3]]}' },
    { label: 'Largest: path of 12 cities', input: '{"n":12,"connections":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]]}' },
    { label: 'Long run: random tree on 12 cities', input: '{"n":12,"connections":[[0,1],[1,2],[0,3],[3,4],[3,5],[2,6],[5,7],[2,8],[4,9],[6,10],[4,11]]}' },
  ],
}

export default function ReorderRoutes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <GraphTraversalView title="Roads drawn as arrows; search from city zero" n={run.input.n}
        edges={run.input.connections} directed
        current={step.from ?? step.city} neighbour={step.from !== null ? step.city : null}
        visited={step.visited} frontier={step.stack} frontierKind="stack"
        legend={{ neighbour: 'road being walked' }} />
      <output aria-label="Reversals so far">{`Reversals counted: ${step.count}`}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>Searching outward from city zero, each road is crossed exactly once. A road crossed in its drawn direction points away from zero and must be reversed.</p>
      <p>The search reaches every city because the roads form a tree, so each road is counted exactly once.</p>
    </>
  )} />
}
