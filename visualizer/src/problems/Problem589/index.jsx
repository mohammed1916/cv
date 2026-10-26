import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreeOutline from '../../components/shared/TreeOutline'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin with the root.' },
    { id: 'visit', label: 'Visit node', description: 'Record the node, then push its children.' },
    { id: 'done', label: 'Complete', description: 'Return the preorder list.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'N-ary tree (LeetCode serialization JSON)',
  url: 'https://leetcode.com/problems/n-ary-tree-preorder-traversal/',
  complexity: 'O(n) time and O(h) stack space, where h is the height of the tree.',
  examples: [
    { label: 'Example tree', input: '[1,null,3,2,4,null,5,6]' },
    { label: 'Single node', input: '[1]' },
    { label: 'Empty', input: '[]' },
  ],
}

export default function NaryPreorder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.visited?.forEach(id => { roles[id] = 'visited' })
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <TreeOutline title="N-ary tree" root={run.root} roles={roles} />
      <output aria-label="Preorder output">[{step.order.join(', ')}]</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Stack order:</strong> children are pushed in reverse so the leftmost child is popped next, which keeps the left-to-right order of the children.</p>
  </>} />
}
