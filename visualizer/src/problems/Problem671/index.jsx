import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Minimum', description: 'The root holds the smallest value in the tree.' },
    { id: 'visit', label: 'Equal to minimum', description: 'Nodes equal to the minimum are passed through.' },
    { id: 'candidate', label: 'Candidate', description: 'A value above the minimum is a candidate; its subtree is skipped.' },
    { id: 'done', label: 'Second minimum', description: 'The smallest candidate, or -1 when there is none.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Special binary tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/second-minimum-node-in-a-binary-tree/',
  complexity: 'O(n) time in the worst case and O(h) recursion space; candidate pruning skips subtrees.',
  examples: [
    { label: 'Two levels', input: '[3,3,7,3,3]' },
    { label: 'Flat', input: '[4,4,4]' },
    { label: 'Deep candidate', input: '[5,5,9,null,null,9,11]' },
  ],
}

export default function SecondMinimumNode() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null && step.node !== undefined) roles[step.node] = step.phase === 'candidate' ? 'candidate' : 'current'
    return <>
      <BinaryTreeLane title="Special tree" root={run.root} roles={roles} note={`minimum ${step.first} · second so far ${step.second === -1 ? 'none' : step.second}`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why stop at a candidate:</strong> in this tree each parent is the minimum of its subtree, so nothing below a larger value can be smaller than it.</p>
  </>} />
}
