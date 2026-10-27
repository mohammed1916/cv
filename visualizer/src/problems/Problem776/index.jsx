import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Choose the split value.' },
    { id: 'visit', label: 'Visit node', description: 'Decide which side of the split this node belongs to.' },
    { id: 'done', label: 'Split', description: 'Both trees are assembled.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'BST (JSON level order) and target',
  url: 'https://leetcode.com/problems/split-bst/',
  complexity: 'O(h) time for height h, since each step descends one level. The visualization caps input at 30 nodes.',
  examples: [
    { label: 'Example 1', input: '{"arr":[4,2,6,1,3,5,7],"target":2}' },
    { label: 'Split high', input: '{"arr":[5,3,8],"target":6}' },
  ],
}

export default function SplitBST() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = Object.fromEntries(Object.entries(step.roles).map(([id, role]) => [id, role === 'small' ? '≤ target' : '> target']))
    const roles = {}
    for (const [id, role] of Object.entries(step.roles)) roles[id] = role === 'small' ? 'visited' : 'active'
    return <>
      <BinaryTreeLane title="Original tree" root={run.root} roles={roles} tags={tags} />
      <output aria-label="Result">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>The BST order decides everything: a node at most the target keeps its left subtree and the split of its right subtree goes after it. A node above the target does the mirror image.</p>
    <p>Each split returns two roots, so the pointers are rewired as the recursion unwinds.</p>
  </>} />
}
