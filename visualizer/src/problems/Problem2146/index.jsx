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
