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
    { label: 'Own case 1', input: '[4,6,2,7,3,1,9,null,null,8,5]' },
    { label: 'Own case 2', input: '[2]' },
    { label: 'Own case 3', input: '[1,2,4,null,3]' },
    { label: 'Two levels', input: '[2,1,3]' },
    { label: 'Chain of left children', input: '[0,1,null,2,null,3]' },
    { label: 'Largest value as root', input: '[99]' },
    { label: 'Long run: 15 nodes', input: '[84,34,29,40,80,78,16,30,83,3,54,38,0,75,81]' },
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
