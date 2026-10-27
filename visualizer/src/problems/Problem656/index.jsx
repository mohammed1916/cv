import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Plan backwards', description: 'Costs are computed from the last index toward the first.' },
    { id: 'fill', label: 'Cheapest from here', description: 'Add the coin here to the cheapest reachable continuation.' },
    { id: 'walk', label: 'Walk forward', description: 'From index 1, take the earliest index that keeps the optimal cost.' },
    { id: 'done', label: 'Complete', description: 'Report the path, or no path.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Coins and maximum jump (JSON)',
  url: 'https://leetcode.com/problems/coin-path/',
  complexity: 'O(n * maxJump) time and O(n) space. The visualization caps input at 30 coins.',
  examples: [
    { label: 'Example 1', input: '{"coins":[1,2,4,-1,2],"maxJump":2}' },
    { label: 'No path', input: '{"coins":[1,2,4,-1,2],"maxJump":1}' },
  ],
}

export default function CoinPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Cheapest total from each index" length={run.coins.length} active={step.index ?? -1}
      valueAt={i => (step.cost[i] === Infinity ? '∞' : step.cost[i])}
      roleAt={i => (step.path.includes(i) ? 'read' : '')} />
    <output aria-label="Path">{step.path.length ? `Path so far: ${step.path.map(i => i + 1).join(' → ')}` : 'No path yet'}</output>
  </>} renderReasoning={() => <>
    <p>The cheapest cost from an index depends only on later indices, so one backwards pass computes it for every index in turn.</p>
    <p>Walking forward, several next steps can share the best cost. Taking the earliest one gives the lexicographically smallest path among the cheapest ones.</p>
  </>} />
}
