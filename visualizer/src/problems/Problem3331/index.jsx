import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'
import { sizeTutorial } from './tutorial'
import { examples } from './presets.js'
import './Subtree3331.css'

const phases = [
  { id: 'start', label: 'Start', description: 'Set up the child lists and sizes.' },
  { id: 'build', label: 'Children', description: 'Link each node into its parent list.' },
  { id: 'enter', label: 'Enter', description: 'Visit a node and note its nearest same-letter ancestor.' },
  { id: 'link', label: 'Remember', description: 'Make this node the latest entry for its letter.' },
  { id: 'children', label: 'Push', description: 'Schedule the children and the exit marker.' },
  { id: 'exit', label: 'Leave', description: 'Restore the previous same-letter entry.' },
  { id: 'merge', label: 'Merge', description: 'Add the subtree to its effective parent.' },
  { id: 'done', label: 'Result', description: 'Report every subtree size.' },
]

// Goal drawing: the worked example before and after moving node 2 under node 0.
const goalDiagram = (
  <svg className="goal-diagram" width="320" viewBox="0 0 320 124" role="img" aria-label="Before: a chain 0 a, 1 b, 2 a. After: node 2 moves under node 0, so 0 has children 1 and 2.">
    <g fill="none" stroke="currentColor" opacity=".5">
      <line x1="50" y1="22" x2="50" y2="58" /><line x1="50" y1="58" x2="50" y2="94" />
      <line x1="230" y1="22" x2="200" y2="58" /><line x1="230" y1="22" x2="260" y2="58" />
    </g>
    {[[50, 22, '0', 'a'], [50, 58, '1', 'b'], [50, 94, '2', 'a'], [230, 22, '0', 'a'], [200, 58, '1', 'b'], [260, 58, '2', 'a']].map(([x, y, id, letter]) =>
      <g key={`${x}-${y}`}>
        <circle cx={x} cy={y} r="13" style={{fill: 'var(--surface2)'}} stroke="currentColor" strokeWidth="1.5" />
        <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fill="currentColor">{id}{letter}</text>
      </g>)}
    <text x="50" y="122" textAnchor="middle" fontSize="11" fill="currentColor">before</text>
    <text x="230" y="122" textAnchor="middle" fontSize="11" fill="currentColor">after: sizes [3, 1, 1]</text>
  </svg>
)

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with parent (parent[0] = -1, parents come earlier) and s (letters a to e)',
  url: 'https://leetcode.com/problems/find-subtree-sizes-after-changes/',
  complexity: 'O(n) time and space with the iterative DFS: each node and edge is handled a constant number of times. The visualization caps the tree at 10 nodes.',
  goal: {
    summary: 'Move every node under its nearest ancestor with the same letter, then report each node\'s subtree size in the new tree.',
    requirement: [
      'Node 0 is the root. parent[i] is the parent of node i, and every parent has a smaller index than its child.',
      'For each node x, its new parent is the nearest ancestor (in the original tree) with the same letter as x.',
      'If no ancestor has the same letter, x keeps its original parent.',
      'Return the subtree size of every node in the new tree, in node order.',
      'Input limits used by this visualizer: 1–10 nodes, letters a to e.',
    ],
    example: 'parent = [-1, 0, 1], s = "aba". Node 2 (a) skips its b parent and moves under node 0 (a). Node 0 now has children 1 and 2, so the sizes are [3, 1, 1].',
  },
  goalDiagram,
  tutorial: sizeTutorial,
  examples,
}

const LAST_LABEL = 'Nearest same-letter ancestor (last)'
export default function SubtreeSizesAfterChanges() {
  return <AlgorithmWorkspace definition={definition} tutorial={sizeTutorial} narration="3331" renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node >= 0) roles[step.node] = 'focus'
    if (step.y >= 0 && step.phase !== 'exit') roles[step.y] = 'target'
    const entries = Object.entries(step.last ?? {})
    return <>
      <RootedTreeDiagram root={run.root} roles={roles} title="Original tree (node ids)" />
      <p aria-label={LAST_LABEL}>
        {entries.length ? entries.map(([letter, id]) => <span key={letter} className="problem-3331__chip">{letter} → node {id}</span>) : 'No letters on the path yet.'}
      </p>
      <output aria-label="Subtree sizes">{`Sizes: [${(step.sizes ?? run.result).join(', ')}]`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A node's new parent is its nearest ancestor with the same letter; if there is none, it keeps its original parent.</p>
    <p>The DFS keeps the latest node for each letter on the current path, so each node's candidate parent is available when it is entered.</p>
  </>} />
}
