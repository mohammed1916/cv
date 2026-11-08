import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin in city 0 at time 0 with its fee.' },
    { id: 'relax', label: 'Relax edge', description: 'Arrive at a city at an exact time for a lower total fee.' },
    { id: 'done', label: 'Complete', description: 'Take the cheapest arrival at the last city.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with max_time, edges, and passing_fees (JSON)',
  url: 'https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/',
  complexity: 'O(maxTime * E) time and O(maxTime * n) space. The visualization caps max_time at 8 and cities at 4.',
  examples: [
    { label: 'Example 1', input: '{"max_time":3,"edges":[[0,1,1],[1,2,1],[0,2,3]],"passing_fees":[1,5,1]}' },
    { label: 'Example 2', input: '{"max_time":1,"edges":[[0,1,2]],"passing_fees":[1,2]}' },
    { label: 'Single edge', input: '{"max_time":1,"edges":[[0,1,1]],"passing_fees":[1,1]}' },
    { label: 'Equal-cost routes', input: '{"max_time":4,"edges":[[0,1,2],[0,2,2],[1,2,1]],"passing_fees":[2,3,2]}' },
    { label: 'Largest limits', input: '{"max_time":8,"edges":[[0,1,4],[1,2,4],[2,3,4],[0,3,4],[0,2,4],[1,3,4]],"passing_fees":[9,9,9,9]}' },
    { label: 'Long run: 4 cities, 6 edges', input: '{"max_time":8,"edges":[[0,1,2],[1,2,3],[2,3,4],[0,3,1],[0,2,2],[1,3,3]],"passing_fees":[2,4,6,1]}' },
  ],
}

export default function MinimumCostInTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Cost by time (rows) and city (columns)" values={step.table}
      rowLabels={step.table.map((_, t) => `t${t}`)} columnLabels={run.input.passing_fees.map((_, v) => `city ${v}`)}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Result">{step.phase === 'done' ? `Answer: ${run.result}` : `Time budget ${run.input.max_time}, last city ${run.input.passing_fees.length - 1}`}</output>
  </>} renderReasoning={() => <>
    <p>Each road takes a fixed number of time units, so the state is the exact time and the city where the journey is.</p>
    <p>Fees count every city visited, including the start and the destination, and cities may be revisited.</p>
  </>} />
}
