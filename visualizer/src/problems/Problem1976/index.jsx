import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1976',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with n and roads [u, v, time] (e.g. {"n":4,"roads":[[0,1,2],[1,3,2],[0,2,3],[2,3,1]]})',
  url: 'https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/',
  complexity: 'O(n²) time with this selection loop (O((n + m) log n) with a heap), and O(n + m) space.',
  examples: [
    { label: 'Two routes tie', input: '{"n":4,"roads":[[0,1,2],[1,3,2],[0,2,3],[2,3,1]]}' },
    { label: 'Triangle', input: '{"n":3,"roads":[[0,1,1],[1,2,1],[0,2,2]]}' },
  ],
}

export default function Problem1976Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const tags = {}
      step.tags.forEach((t, i) => { tags[i] = t.d === null ? 'd=∞' : `d=${t.d} · ${t.w}` })
      return <>
        <GraphTraversalView title="Shortest times and route counts" n={run.input.n}
          edges={run.input.roads.map(([u, v]) => [u, v])}
          current={step.current} neighbour={step.neighbour} visited={step.settled} done={step.settled}
          tags={tags} showFrontier={false} legend={{ done: 'settled', visited: 'settled' }} />
        <p>Tags show the best time (d) and the number of routes (w) that achieve it so far.</p>
        {step.result !== undefined && <output aria-label="Routes">Shortest routes: {step.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
