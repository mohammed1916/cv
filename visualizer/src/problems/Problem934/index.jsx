import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Two islands are present.' },
    { id: 'flood', label: 'DFS flood', description: 'Mark every cell of the first island and seed the frontier.' },
    { id: 'expand', label: 'BFS expand', description: 'Claim adjacent water cells layer by layer.' },
    { id: 'found', label: 'Touch', description: 'The frontier reaches the second island.' },
    { id: 'done', label: 'Complete', description: 'Return the number of flips.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Grid (JSON 0/1 matrix)',
  url: 'https://leetcode.com/problems/shortest-bridge/',
  complexity: 'O(n^2) time and space. The visualization caps the grid at 12x12.',
  examples: [
    { label: 'Example 1', input: '[[0,1],[1,0]]' },
    { label: 'Example 2', input: '[[0,1,0],[0,0,0],[0,0,1]]' },
    { label: 'Example 3', input: '[[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]]' },
  ],
}

const show = v => v === 0 ? '.' : v === 1 ? 'B' : v === 2 ? 'A' : `~${-v}`

export default function ShortestBridge() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable title="Grid (A = first island, B = second island, ~k = bridge layer k)" values={step.grid.map(r => r.map(show))}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Flips">Layers grown: {step.flips}</output>
  </>} renderReasoning={() => <>
    <p>DFS isolates one island so the other is unambiguous. Every cell of the first island starts in the BFS frontier at distance zero.</p>
    <p>BFS adds one ring of water per layer, so the layer at which a frontier cell first touches the second island is the minimum number of water cells to flip.</p>
  </>} />
}
