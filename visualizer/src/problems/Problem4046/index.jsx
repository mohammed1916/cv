import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GridTurnsView from './GridTurnsView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Put the top-left cell in the queue.' },
    { id: 'pop', label: 'Pop', description: 'Take the cheapest state.' },
    { id: 'stale', label: 'Stale', description: 'A cheaper route already exists.' },
    { id: 'limit', label: 'Turn limit', description: 'This turn would exceed k.' },
    { id: 'relax', label: 'Relax', description: 'A neighbour gets a cheaper cost.' },
    { id: 'keep', label: 'Keep', description: 'The stored cost is already cheaper.' },
    { id: 'goal', label: 'Goal', description: 'The bottom-right cell is popped.' },
    { id: 'done', label: 'Result', description: 'Report the minimum cost or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with grid and k, e.g. {"grid":[[1,3],[2,4]],"k":1}',
  url: 'https://leetcode.com/problems/minimum-cost-path-with-at-most-k-turns/',
  complexity: 'O(R * C * k log(R * C * k)) time with a priority queue over states; O(R * C * k) space. The visualization caps the grid at 6 by 6 with values up to 9.',
  examples: [
    { label: 'Zig-zag', input: '{"grid":[[1,3,1],[1,5,1],[4,2,1]],"k":2}' },
    { label: 'One turn', input: '{"grid":[[1,2,3],[4,5,6]],"k":1}' },
    { label: "One cell", input: "{\"grid\":[[5]],\"k\":0}" },
    { label: "Equal values", input: "{\"grid\":[[2,2],[2,2]],\"k\":1}" },
    { label: "Largest grid and values", input: "{\"grid\":[[9,0,9,0,9,0],[0,9,0,9,0,9],[9,0,9,0,9,0],[0,9,0,9,0,9],[9,0,9,0,9,0],[0,9,0,9,0,9]],\"k\":5}" },
    { label: "Long run: six by six grid", input: "{\"grid\":[[0,0,0,4,3,4],[5,3,7,2,3,3],[7,5,9,3,8,1],[2,9,0,8,3,0],[6,3,4,4,0,6],[0,6,0,2,9,4]],\"k\":3}" },
  ],
}

export default function MinimumCostPathWithKTurns() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GridTurnsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
