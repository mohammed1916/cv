import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every subset of branches is a candidate open set.' },
    { id: 'subset', label: 'Subset', description: 'Keep only roads between open branches, then check every pair.' },
    { id: 'done', label: 'Result', description: 'Report how many open sets are valid.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": 4, "maxDistance": 4, "roads": [[0,1,3],[1,2,2]]}',
  url: 'https://leetcode.com/problems/number-of-possible-sets-of-closing-branches/',
  complexity: 'O(2^n * n^3) time with Floyd-Warshall per subset. The visualization caps n at 6 and roads at 15.',
  examples: [
    { label: 'Four branches', input: '{"n":4,"maxDistance":4,"roads":[[0,1,3],[1,2,2],[2,3,4],[0,3,9]]}' },
    { label: 'Chain of three', input: '{"n":3,"maxDistance":6,"roads":[[0,1,2],[1,2,3]]}' },
    { label: 'One branch', input: '{"n":1,"maxDistance":1,"roads":[]}' },
    { label: 'Road exactly at the limit', input: '{"n":2,"maxDistance":5,"roads":[[0,1,5]]}' },
    { label: 'Wide limit, heavy roads', input: '{"n":6,"maxDistance":60,"roads":[[0,1,20],[0,2,20],[0,3,20],[0,4,20],[0,5,20],[1,2,20],[1,3,20],[1,4,20],[1,5,20],[2,3,20],[2,4,20],[2,5,20],[3,4,20],[3,5,20],[4,5,20]]}' },
    { label: 'Long run: 6 branches', input: '{"n":6,"maxDistance":25,"roads":[[0,1,17],[0,2,15],[0,3,11],[0,4,12],[0,5,5],[1,2,9],[1,3,18],[1,4,7],[1,5,10],[2,3,2],[2,4,3],[2,5,5],[3,4,6],[3,5,10],[4,5,11]]}' },
  ],
}

export default function ClosingBranches() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, roads } = run.input
    const open = step.open || []
    const tags = Object.fromEntries(Array.from({ length: n }, (_, i) => [i, open.includes(i) ? 'open' : 'closed']))
    return <>
      <GraphTraversalView title="Branches and roads" n={n} edges={roads.map(([u, v]) => [u, v])}
        labels={Array.from({ length: n }, (_, i) => String(i))} visited={open} tags={step.mask >= 0 ? tags : {}} showFrontier={false}
        legend={{ visited: 'open branch' }} />
      <output aria-label="Valid sets so far">{`Valid sets so far: ${step.count}${step.mask >= 0 ? `; subset ${step.mask} (${open.length ? open.join(', ') : 'empty'}) worst distance ${step.worst ?? 'unreachable'}` : ''}`}</output>
      <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Only roads whose two ends both stay open can be used. Each subset is judged on its own: the distances are recomputed for the open branches, and every pair of them must be within the limit.</p>
    <p>The empty set and single branches always count.</p>
  </>} />
}
