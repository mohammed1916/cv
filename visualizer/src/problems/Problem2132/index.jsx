import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2132',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with grid (0 empty, 1 occupied), stampHeight and stampWidth',
  url: 'https://leetcode.com/problems/stamping-the-grid/',
  complexity: 'O(m n) time for the prefix sums, the placements and the coverage pass; O(m n) extra space.',
  examples: [
    { label: 'Single cells fit', input: '{"grid":[[0,0,0],[0,1,0],[0,0,0]],"stampHeight":1,"stampWidth":1}' },
    { label: 'Blocked pocket', input: '{"grid":[[0,0,0,0],[0,1,0,0],[0,0,0,0]],"stampHeight":1,"stampWidth":2}' },
    { label: 'Full cover', input: '{"grid":[[0,0,0],[0,0,0]],"stampHeight":2,"stampWidth":3}' },
  ],
}

export default function Problem2132Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <GraphTraversalView
          title="Grid: dark cells are occupied; the outlined cell is the stamp corner"
          grid={{ rows: step.grid.length, cols: step.grid[0].length, blocked: (r, c) => step.grid[r][c] === 1, text: (r, c) => (step.grid[r][c] === 1 ? '#' : '') }}
          current={step.current}
          frontier={step.stamp ?? []}
          frontierKind="stack"
          frontierTitle="Stamp cells"
          visited={step.covered}
          showFrontier={false}
          legend={{ frontier: 'cells under this stamp', visited: 'covered by a valid stamp', current: 'stamp corner' }}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
