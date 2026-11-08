import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Graph', description: 'Read the edges and build neighbour sets.' },
    { id: 'degree', label: 'Odd nodes', description: 'Collect the nodes with an odd degree.' },
    { id: 'pair', label: 'Direct edge', description: 'Two odd nodes that are not neighbours get one edge.' },
    { id: 'detour', label: 'Helper', description: 'Two odd nodes that are neighbours need a helper node.' },
    { id: 'pairing', label: 'Pairing', description: 'Four odd nodes split into two pairs of non-neighbours.' },
    { id: 'done', label: 'Result', description: 'Report whether two new edges are enough.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges (1-based pairs)',
  url: 'https://leetcode.com/problems/add-edges-to-make-degrees-of-all-nodes-even/',
  complexity: 'O(n + m) time with neighbour sets. The number of odd nodes decides the case, so the search checks at most three pairings.',
  examples: [
    { label: 'Path', input: '{"n":4,"edges":[[1,2],[2,3]]}' },
    { label: 'Star', input: '{"n":4,"edges":[[1,2],[1,3],[1,4]]}' },
    { label: 'Cycle', input: '{"n":5,"edges":[[1,2],[2,3],[3,4],[4,5],[5,1]]}' },
    { label: 'No edges', input: '{"n":3,"edges":[]}' },
    { label: 'Two disjoint edges', input: '{"n":4,"edges":[[1,2],[3,4]]}' },
    { label: 'Largest graph, 30 edges', input: '{"n":12,"edges":[[12,11],[7,1],[9,10],[6,5],[2,3],[7,11],[10,2],[1,12],[7,6],[7,8],[10,8],[1,10],[6,3],[6,11],[11,1],[1,4],[2,1],[1,5],[7,4],[8,6],[8,1],[8,5],[5,7],[11,10],[1,3],[11,8],[9,6],[1,9],[10,7],[12,5]]}' },
    { label: 'Long run: 18 edges', input: '{"n":12,"edges":[[1,10],[11,4],[4,8],[5,11],[3,10],[11,8],[2,4],[8,9],[1,5],[3,5],[7,3],[5,10],[12,8],[11,9],[8,6],[8,1],[3,2],[5,7]]}' },
  ],
}

export default function AddEdgesEvenDegrees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Odd-degree nodes">{`Odd nodes: ${step.odd && step.odd.length ? step.odd.join(', ') : 'none yet'}`}</output>
    <output aria-label="Candidate edges">{step.pair ? `Candidate: ${step.pair.join(' - ')}` : 'No candidate edge yet.'}</output>
  </>} renderReasoning={() => <>
    <p>Adding an edge changes the parity of exactly two degrees, so only the odd-degree nodes need edges.</p>
    <p>With two odd nodes, either one direct edge or a helper node joined to both works. With four, the only useful choice is which two pairs to join.</p>
  </>} />
}
