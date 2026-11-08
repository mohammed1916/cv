import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DisjointSetView from '../../components/shared/DisjointSetView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Parents', description: 'Each node starts as its own set.' },
    { id: 'twoParents', label: 'Two parents', description: 'A node with two incoming edges gives two candidates.' },
    { id: 'skip', label: 'Skip candidate', description: 'Set the second candidate aside and union everything else.' },
    { id: 'union', label: 'Union edge', description: 'Join two sets when the edge does not close a cycle.' },
    { id: 'cycle', label: 'Cycle found', description: 'An edge inside one set closes a cycle.' },
    { id: 'done', label: 'Remove', description: 'Remove the edge that breaks the tree.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Directed edges (JSON array of [u, v] pairs)',
  url: 'https://leetcode.com/problems/redundant-connection-ii/',
  complexity: 'O(n α(n)) time with union-find, where α is the inverse Ackermann function.',
  examples: [
    { label: 'Two parents', input: '[[1,2],[1,3],[2,3]]' },
    { label: 'Cycle', input: '[[1,2],[2,3],[3,1],[1,4]]' },
    { label: 'Both', input: '[[2,1],[3,1],[4,2],[1,4]]' },
    { label: 'Smallest cycle', input: '[[1,2],[2,3],[3,1]]' },
    { label: 'Opposite edges', input: '[[1,2],[2,1],[2,3]]' },
    { label: 'Longest cycle', input: '[[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,1]]' },
    { label: 'Long run: 20 edges', input: '[[1,2],[1,3],[3,4],[4,5],[1,6],[6,7],[6,8],[6,9],[1,10],[4,11],[4,12],[11,13],[11,14],[8,15],[7,16],[9,17],[9,18],[12,19],[9,20],[4,1]]' },
  ],
}

export default function RedundantConnectionII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.length
    const parent = step.dsu.map(x => x - 1)
    const size = Array(n).fill(0)
    parent.forEach(p => { size[p]++ })
    const labels = Array.from({ length: n }, (_, i) => String(i + 1))
    return <>
      <DisjointSetView parent={parent} size={size} labels={labels} />
      <output aria-label="Current edge">{step.edge ? `Edge ${step.edge[0]} → ${step.edge[1]}` : step.result ? `Remove ${step.result[0]} → ${step.result[1]}` : 'Setup'}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why two cases:</strong> a node with two parents must lose one of its edges, and a cycle must lose one edge; the two cases can overlap, which is why the second candidate is skipped first.</p>
  </>} />
}
