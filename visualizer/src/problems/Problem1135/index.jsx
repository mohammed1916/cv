import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with cities and roads [a, b, cost] (JSON)',
  url: 'https://leetcode.com/problems/connecting-cities-with-minimum-cost/',
  complexity: 'O(m log m) time to sort m roads, plus near-constant union-find work per road. The visualization caps the input at 8 cities and 20 roads.',
  examples: [
    { label: 'Triangle', input: '{"cities":3,"roads":[[1,2,4],[2,3,2],[1,3,9]]}' },
    { label: 'Unreachable city', input: '{"cities":4,"roads":[[1,2,3],[3,4,4]]}' },
    { label: 'Single city', input: '{"cities":1,"roads":[]}' },
  ],
}

export default function ConnectingCities() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { cities, roads } = run.input
    const { parent, joined, total, current } = step.snapshot
    const rootOf = c => { let x = c; while (parent[x - 1] !== x) x = parent[x - 1]; return x }
    const tags = Object.fromEntries(Array.from({ length: cities }, (_, i) => [i, `group ${rootOf(i + 1)}`]))
    const built = new Set(joined.flat())
    return <>
      <GraphTraversalView title="Road network (Kruskal)" n={cities}
        edges={roads.map(([a, b]) => [a - 1, b - 1])}
        labels={Array.from({ length: cities }, (_, i) => `City ${i + 1}`)}
        current={current ? current[0] - 1 : null} neighbour={current ? current[1] - 1 : null}
        done={[...built].map(c => c - 1)} tags={tags} showFrontier={false} />
      <p>{joined.length ? `Built roads: ${joined.map(([a, b]) => `${a}-${b}`).join(', ')}` : 'No roads built yet.'}</p>
      <output aria-label="Total cost">{`Total cost ${total}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Cheapest first:</strong> the cheapest road that joins two separate groups is always safe to build.</p>
    <p><strong>Skip loops:</strong> a road whose ends are already connected would only add cost, so it is skipped.</p>
  </>} />
}
