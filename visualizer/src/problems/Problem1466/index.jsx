import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Example 1', input: '{"n": 6, "connections": [[0,1],[1,3],[2,3],[4,0],[4,5]]}' },
    { label: 'Example 2', input: '{"n": 5, "connections": [[1,0],[1,2],[3,2],[3,4]]}' },
  ],
}

export default function ReorderRoutes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="Cities reached from city zero" length={run.input.n}
        valueAt={i => (step.visited.includes(i) ? 'seen' : '-')} active={step.city ?? -1} />
      <output aria-label="Reversals so far">{`Reversals counted: ${step.count}`}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>Searching outward from city zero, each road is crossed exactly once. A road crossed in its drawn direction points away from zero and must be reversed.</p>
      <p>The search reaches every city because the roads form a tree, so each road is counted exactly once.</p>
    </>
  )} />
}
