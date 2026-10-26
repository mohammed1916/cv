import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreeOutline from '../../components/shared/TreeOutline'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin with the root.' },
    { id: 'enter', label: 'Descend', description: 'Move into the next child.' },
    { id: 'exit', label: 'Emit node', description: 'All children are finished, so emit this node.' },
    { id: 'done', label: 'Complete', description: 'Return the postorder list.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'N-ary tree (LeetCode serialization JSON)',
  url: 'https://leetcode.com/problems/n-ary-tree-postorder-traversal/',
  complexity: 'O(n) time and O(h) stack space, where h is the height of the tree.',
  examples: [
    { label: 'Example tree', input: '[1,null,3,2,4,null,5,6]' },
    { label: 'Single node', input: '[1]' },
    { label: 'Empty', input: '[]' },
  ],
}

export default function NaryPostorder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.finished?.forEach(id => { roles[id] = 'visited' })
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <TreeOutline title="N-ary tree" root={run.root} roles={roles} note="grey: not yet emitted" />
      <output aria-label="Postorder output">[{step.order.join(', ')}]</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why postorder:</strong> a parent's value is appended only after every subtree below it is complete, so each child precedes its parent.</p>
  </>} />
}
