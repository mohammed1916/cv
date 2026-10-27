import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Ask the root for its deepest leaf and common ancestor.' },
    { id: 'leaf', label: 'Leaf', description: 'A leaf reports its own depth.' },
    { id: 'pass', label: 'Pass up', description: 'The deeper side decides this subtree.' },
    { id: 'join', label: 'Join', description: 'Equal depths on both sides make this node the answer candidate.' },
    { id: 'done', label: 'Complete', description: 'Report the common ancestor.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree with unique values 0-99 (JSON level order)',
  url: 'https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/',
  complexity: 'O(n) time and O(h) space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '[3,5,1,6,2,0,8,null,null,7,4]' },
    { label: 'Example 2', input: '[1]' },
    { label: 'Example 3', input: '[0,1,3,null,2]' },
  ],
}

export default function LcaDeepestLeaves() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.deepest) roles[id] = 'match'
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree (deepest leaves highlighted)" root={run.root} roles={roles} />
    </>
  }} renderReasoning={() => <>
    <p>A subtree's answer is its deepest leaves' common ancestor. If both children reach the same depth, the current node is that ancestor.</p>
    <p>If one side is deeper, all deepest leaves live there, so its answer is the answer for the whole subtree.</p>
  </>} />
}
