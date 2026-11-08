import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import DPDependencyView from '../../components/shared/DPDependencyView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Plan backwards', description: 'Costs are computed from the last index toward the first.' },
    { id: 'fill', label: 'Cheapest from here', description: 'Add the coin here to the cheapest reachable continuation.' },
    { id: 'walk', label: 'Walk forward', description: 'From index 1, take the earliest index that keeps the optimal cost.' },
    { id: 'done', label: 'Complete', description: 'Report the path, or no path.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Coins and maximum jump (JSON)',
  url: 'https://leetcode.com/problems/coin-path/',
  complexity: 'O(n * maxJump) time and O(n) space. The visualization caps input at 30 coins.',
  examples: [
    { label: 'Example 1', input: '{"coins":[1,2,4,-1,2],"maxJump":2}' },
    { label: 'No path', input: '{"coins":[1,2,4,-1,2],"maxJump":1}' },
    { label: 'Single coin', input: '{"coins":[0],"maxJump":1}' },
    { label: 'Equal costs tie-break', input: '{"coins":[0,0,0,0],"maxJump":2}' },
    { label: 'Blocked last coin', input: '{"coins":[1,-1],"maxJump":1}' },
    { label: 'Largest coins and jump', input: '{"coins":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],"maxJump":30}' },
    { label: 'Long run: 30 coins', input: '{"coins":[1,49,98,83,-1,75,62,7,69,-1,39,-1,49,-1,41,5,89,17,-1,77,9,-1,-1,42,56,27,-1,1,69,92],"maxJump":4}' },
  ],
}

export default function CoinPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.coins.length
    const maxJump = run.input.maxJump
    const filling = step.index !== null && step.index >= 0 && run.coins[step.index] !== -1 && step.phase === 'fill'
    // While filling index i, the candidates are the next maxJump indices; the cheapest one is marked chosen.
    let sources = []
    if (filling) {
      const i = step.index
      const options = []
      for (let j = i + 1; j < Math.min(n, i + maxJump + 1); j++) if (step.cost[j] !== Infinity) options.push(j)
      const best = options.length ? Math.min(...options.map(j => step.cost[j])) : null
      const chosen = options.find(j => step.cost[j] === best)
      sources = options.map(j => ({ cell: [0, j], chosen: j === chosen }))
    }
    return <>
      <DPDependencyView title="Cheapest cost from each index" shape="linear" values={step.cost}
        target={filling ? step.index : 0} sources={sources}
        recurrence="cost[i] = coins[i] + min(cost[i+1 .. i+maxJump])" />
      <IndexedSequence label="Path cells" length={n} active={step.index ?? -1}
        valueAt={i => (step.cost[i] === Infinity ? '∞' : step.cost[i])}
        roleAt={i => (step.path.includes(i) ? 'on path' : '')} />
      <output aria-label="Path">{step.path.length ? `Path so far: ${step.path.map(i => i + 1).join(' → ')}` : 'No path yet'}</output>
    </>
  }} renderReasoning={() => <>
    <p>The cheapest cost from an index depends only on later indices, so one backwards pass computes it for every index in turn.</p>
    <p>Walking forward, several next steps can share the best cost. Taking the earliest one gives the lexicographically smallest path among the cheapest ones.</p>
  </>} />
}
