import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2146',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with grid, pricing [low, high], start [row, col] and k',
  url: 'https://leetcode.com/problems/k-highest-ranked-items-within-a-price-range/',
  complexity: 'O(m n log(m n)) time: a breadth-first search plus sorting the items found; O(m n) space.',
  examples: [
    { label: 'Ranked by distance', input: '{"grid":[[1,2,0,3],[1,1,1,4],[2,0,1,5]],"pricing":[2,5],"start":[0,0],"k":3}' },
    { label: 'Walls block', input: '{"grid":[[1,0,2],[0,0,3],[4,1,1]],"pricing":[2,4],"start":[2,2],"k":2}' },
    { label: 'Single priced cell', input: '{"grid":[[2]],"pricing":[2,2],"start":[0,0],"k":1}' },
    { label: 'Equal distance and price', input: '{"grid":[[1,3],[3,1]],"pricing":[3,3],"start":[0,0],"k":2}' },
    { label: 'No items in price range', input: '{"grid":[[1,9],[9,1]],"pricing":[2,5],"start":[0,0],"k":2}' },
    { label: 'Largest grid, k twenty', input: '{"grid":[[0,5,0,5,0,5,0,5],[3,8,3,8,3,8,3,8],[6,1,6,1,6,1,6,1],[9,4,9,4,9,4,9,4],[2,7,2,7,2,7,2,7],[5,0,5,0,5,0,5,0],[8,3,8,3,8,3,8,3],[1,6,1,6,1,6,1,6]],"pricing":[2,9],"start":[0,1],"k":20}' },
    { label: 'Long run: 8 by 8 grid', input: '{"grid":[[1,1,6,0,0,1,0,0],[7,9,2,2,0,2,4,1],[7,4,2,6,7,4,0,3],[9,5,2,7,2,3,0,2],[8,6,1,7,4,4,2,6],[8,6,0,7,2,2,7,8],[0,8,1,6,0,8,7,5],[5,1,7,3,3,0,5,1]],"pricing":[2,6],"start":[0,0],"k":12}' },
  ],
}

export default function Problem2146Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <GraphTraversalView
            title="Grid: numbers are prices, 0 is a wall, the queue shows the search front"
            grid={{ rows: run.input.grid.length, cols: run.input.grid[0].length, blocked: (r, c) => run.input.grid[r][c] === 0, text: (r, c) => (run.input.grid[r][c] >= 2 ? String(run.input.grid[r][c]) : '') }}
            current={step.current}
            frontier={step.frontier}
            frontierKind="queue"
            visited={step.visited}
            done={step.done ?? []}
            showFrontier={false}
            legend={{ done: 'in the answer' }}
          />
          <RecordStateTable label="Candidates found (distance, price, row, column)" columns={['distance', 'price', 'row', 'col']} rows={step.found.map(([d, p, r, c]) => ({ distance: d, price: p, row: r, col: c }))} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
