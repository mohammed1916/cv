import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreeDiagram from '../../components/shared/TreeDiagram'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1617',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges, a tree on 1-based cities (JSON)',
  url: 'https://leetcode.com/problems/count-subtrees-with-max-distance-between-cities/',
  complexity: 'O(2^n * n^2) time for n cities, with O(n^2) for the distance table. The visualization caps n at 10.',
  examples: [
    { label: 'Star', input: JSON.stringify({ n: 4, edges: [[1, 2], [2, 3], [2, 4]] }) },
    { label: 'Single edge', input: JSON.stringify({ n: 2, edges: [[1, 2]] }) },
    { label: 'Branching path', input: JSON.stringify({ n: 5, edges: [[1, 2], [2, 3], [3, 4], [3, 5]] }) },
  ],
}

// Cities sit on a circle so every edge stays visible.
function circleLayout(n) {
  const cx = 220, cy = 150, radius = 110
  return new Map(Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    return [i, { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }]
  }))
}

export default function CountSubtreesVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, edges, members, connected, diameter, answer, tried } = step.snapshot
    const nodes = Array.from({ length: n }, (_, i) => ({ id: i, val: i + 1 }))
    const treeEdges = edges.map(([u, v]) => ({ fromId: u - 1, toId: v - 1 }))
    return <>
      <TreeDiagram positions={circleLayout(n)} nodes={nodes} edges={treeEdges} activeIds={new Set(members.map(i => i))} />
      <output aria-label="Subset status">{members.length
        ? `Subset ${members.map(i => i + 1).join(', ')}: ${connected === null ? 'not checked yet' : connected ? `connected, diameter ${diameter ?? 'checked'}` : 'not connected'}`
        : 'No subset selected'}</output>
      <output aria-label="Counts by diameter">{`Subsets tried: ${tried}. Counts for diameters 1 to ${n - 1}: [${answer.join(', ')}].`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Enumerate every subset:</strong> with at most ten cities there are at most 1,024 bitmasks, so trying them all is affordable.</p>
    <p><strong>Connected means a subtree:</strong> the chosen cities form a subtree exactly when the search from one of them reaches every other chosen city using only chosen cities.</p>
    <p><strong>Diameter is the largest tree distance:</strong> in a tree the path between two cities is unique, so the largest pairwise distance inside the subset is its diameter.</p>
  </>} />
}
