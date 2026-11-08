import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import EdgeTypesView from './EdgeTypesView'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Alice and Bob each start with every node alone.' },
    { id: 'edge', label: 'Edge', description: 'Decide whether the edge is needed for Alice, Bob, or both.' },
    { id: 'done', label: 'Complete', description: 'Report the removable edge count, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"n": nodes, "edges": [[type, u, v], ...]} with type 1, 2, or 3',
  url: 'https://leetcode.com/problems/remove-max-number-of-edges-to-keep-graph-fully-traversable/',
  complexity: 'O(E alpha(n)) time with two union-find structures after sorting edges by type. The visualization caps input at 6 nodes and 10 edges.',
  examples: [
    { label: 'Invented mesh', input: '{"n":5,"edges":[[3,1,2],[1,2,3],[2,3,4],[1,4,5],[2,1,5],[3,4,5]]}' },
    { label: 'Two islands', input: '{"n":4,"edges":[[1,1,2],[2,3,4],[3,1,4]]}' },
    { label: 'Two nodes, one edge', input: '{"n":2,"edges":[[1,1,2]]}' },
    { label: 'Same pair, two types', input: '{"n":2,"edges":[[3,1,2],[3,2,1]]}' },
    { label: 'Largest: 6 nodes, 10 edges', input: '{"n":6,"edges":[[1,1,2],[2,2,3],[3,3,4],[1,4,5],[2,5,6],[3,6,1],[1,1,2],[2,2,3],[3,3,4],[1,4,5]]}' },
    { label: 'Long run: 10 edges', input: '{"n":6,"edges":[[3,2,5],[1,5,4],[2,3,2],[1,2,5],[3,3,4],[1,1,2],[3,6,2],[1,6,5],[2,3,5],[1,3,1]]}' },
  ],
}

export default function RemoveMaxEdges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <EdgeTypesView n={run.input.n} edges={run.input.edges} decisions={step.decisions} activeEdge={step.edge} />
    <p>Alice's groups: {step.groups[0]} · Bob's groups: {step.groups[1]} · each must reach 1 group at the end.</p>
    <table aria-label="Edges and decisions">
      <thead><tr><th scope="col">Edge</th><th scope="col">Type</th><th scope="col">Nodes</th><th scope="col">Decision</th></tr></thead>
      <tbody>{run.input.edges.map(([t, u, v], i) => (
        <tr key={i} className={i === step.edge ? 'is-active' : undefined}><th scope="row">{i}</th><td>{t}</td><td>{`${u}-${v}`}</td><td>{step.decisions[i]}</td></tr>
      ))}</tbody>
    </table>
    <output aria-label="Groups">{`Groups: Alice ${step.groups[0]}, Bob ${step.groups[1]}. Kept ${step.kept}.`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Shared edges (type 3) go first because they serve both people, so each one kept is worth as much as possible.</p>
    <p>A private edge is kept only when it joins two groups for its owner. Any edge that does not is redundant for that person.</p>
  </>} />
}
