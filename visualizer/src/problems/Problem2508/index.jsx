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
