import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

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
    { label: 'Example 1', input: '{"grid":[[1,2,3],[2,5,7],[3,5,1]],"queries":[5,6,2]}' },
    { label: 'Example 2', input: '{"grid":[[5,2,1],[1,1,2]],"queries":[3]}' },
  ],
}

export default function GridQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const grid = run.input.grid
    return <>
      <table aria-label="Grid of values">
        <tbody>{grid.map((row, r) => <tr key={r}>{row.map((v, c) => {
          const key = `${r},${c}`
          const done = step.visited.includes(key)
          return <td key={c} data-visited={done ? 'yes' : undefined} aria-label={`cell ${r},${c} value ${v}${done ? ', collected' : ''}`}>{v}</td>
        })}</tr>)}</tbody>
      </table>
      <output aria-label="Points">{`Points so far: ${step.points}${step.query === null ? '' : `, query ${step.query}`}`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>For a query q, the cells that can be collected form the region reachable from the top-left cell through cells below q.</p>
    <p>Queries are processed in increasing order, so the region only grows, and a min heap of frontier cells yields each cell as soon as its value is below the current query.</p>
  </>} />
}
