import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

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
    { label: 'Example 1', input: '{"n":4,"edges":[[3,1,2],[3,2,3],[1,1,3],[1,2,4],[1,1,2],[2,3,4]]}' },
    { label: 'Example 2', input: '{"n":4,"edges":[[3,1,2],[3,2,3],[1,1,4],[2,1,4]]}' },
  ],
}

export default function RemoveMaxEdges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
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
