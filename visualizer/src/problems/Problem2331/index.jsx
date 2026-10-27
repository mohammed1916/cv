import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin evaluating at the root.' },
    { id: 'leaf', label: 'Leaf', description: 'A leaf is its own boolean value.' },
    { id: 'combine', label: 'Combine', description: 'Apply OR or AND to the values of the two children.' },
    { id: 'done', label: 'Result', description: 'Report the value of the root.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level-order full binary tree: leaves 0 or 1, internal 2 for OR or 3 for AND) (JSON)',
  url: 'https://leetcode.com/problems/evaluate-boolean-binary-tree/',
  complexity: 'O(n) time and O(h) stack space for n nodes. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"root":[2,1,3,null,null,0,1]}' },
    { label: 'Example 2', input: '{"root":[0]}' },
  ],
}

export default function EvaluateBooleanTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null) roles[step.node] = 'active'
    const tags = {}
    Object.entries(step.values).forEach(([id, value]) => { tags[id] = value ? 'true' : 'false' })
    return <BinaryTreeLane title="Boolean tree" root={run.display} roles={roles} tags={tags} />
  }} renderReasoning={() => <>
    <p>Each node's value depends only on its children, so evaluating the children first (post-order) gives every node its value once.</p>
    <p>OR is true when either child is true and AND needs both, so the root's value is found in one bottom-up pass.</p>
  </>} />
}
