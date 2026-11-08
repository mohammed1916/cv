import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'House 0', description: 'Open the first neighbourhood in each colour the first house may take.' },
    { id: 'cell', label: 'Next house', description: 'Each colour extends the same colour (same neighbourhood) or any other colour (new neighbourhood).' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest painting with exactly the target neighbourhoods.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with houses, cost, m, n and target (JSON)',
  url: 'https://leetcode.com/problems/paint-house-iii/',
  complexity: 'O(m * target * n^2) time and O(target * n) space. The visualization caps m at 6 and n at 3.',
  examples: [
    { label: 'Own case 1', input: '{"houses":[0,0,0,0,0],"cost":[[5,1],[1,10],[10,1],[10,1],[1,10]],"m":5,"n":2,"target":3}' },
    { label: 'Example 2', input: '{"houses":[1,0,0],"cost":[[1,1],[1,1],[1,1]],"m":3,"n":2,"target":1}' },
    { label: 'Single house', input: '{"houses":[0],"cost":[[4,9,2]],"m":1,"n":3,"target":1}' },
    { label: 'Repeated costs', input: '{"houses":[0,0,0,0],"cost":[[3,3],[3,3],[3,3],[3,3]],"m":4,"n":2,"target":2}' },
    { label: 'No valid painting', input: '{"houses":[1,2,0],"cost":[[1,1],[1,1],[1,1]],"m":3,"n":2,"target":1}' },
    { label: 'Every house its own group', input: '{"houses":[0,0,0,0,0,0],"cost":[[20,1,20],[1,20,1],[20,1,20],[1,20,1],[20,1,20],[1,20,1]],"m":6,"n":3,"target":6}' },
    { label: 'Long run: 6 houses', input: '{"houses":[0,1,3,1,3,1],"cost":[[12,6,6],[4,19,10],[13,10,18],[16,6,16],[15,17,13],[12,20,18]],"m":6,"n":3,"target":3}' },
  ],
}

export default function PaintHouseIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Cheapest cost by neighbourhood count (rows) and colour (columns)" values={step.table}
      rowLabels={Array.from({ length: run.input.target + 1 }, (_, j) => `${j} groups`)}
      columnLabels={Array.from({ length: run.input.n }, (_, c) => `colour ${c + 1}`)}
      activeCell={step.color > 0 ? { row: step.count, column: step.color - 1 } : null} />
    <output aria-label="Result">{step.total === null ? `House ${step.house} of ${run.input.m}` : `Answer: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Painting a house the same colour as the one before it keeps the neighbourhood count, while a new colour starts a new neighbourhood.</p>
    <p>Keeping the cheapest cost for each neighbourhood count and last colour lets each house reuse the answers for the house before it.</p>
  </>} />
}
