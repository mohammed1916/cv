import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import RegionView from './RegionView'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Seed the region with the top-left cell.' },
    { id: 'query', label: 'Query', description: 'Take the next query value in increasing order.' },
    { id: 'expand', label: 'Expand', description: 'Collect the smallest frontier cell below the query and add its unseen neighbours.' },
    { id: 'answer', label: 'Answer', description: 'Record the points collected so far for this query.' },
    { id: 'done', label: 'Complete', description: 'Answers are reported in the original query order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"grid": [[...], ...], "queries": [...]} with values 0 to 9',
  url: 'https://leetcode.com/problems/maximum-number-of-points-from-grid-queries/',
  complexity: 'O(mn log(mn) + q log q) time, since each cell enters the heap once and queries are sorted. The visualization caps the grid at 4 by 4.',
  examples: [
    { label: 'Three queries', input: '{"grid":[[2,4,6],[3,8,1],[5,2,9]],"queries":[4,7,3]}' },
    { label: 'Blocked start', input: '{"grid":[[5,2,1],[1,1,2]],"queries":[3]}' },
  ],
}

export default function GridQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RegionView grid={run.input.grid} step={step} />} renderReasoning={() => <>
    <p>For a query q, the cells that can be collected form the region reachable from the top-left cell through cells below q.</p>
    <p>Queries are processed in increasing order, so the region only grows, and a min heap of frontier cells yields each cell as soon as its value is below the current query.</p>
  </>} />
}
