import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin at the root of the existing maximum tree.' },
    { id: 'descend', label: 'Compare', description: 'val is not larger here, so it belongs to the right.' },
    { id: 'wrap', label: 'New root', description: 'val is larger, so it becomes the root of this subtree.' },
    { id: 'attach', label: 'New leaf', description: 'An empty spot takes val as a leaf.' },
    { id: 'relink', label: 'Relink', description: 'The right child returned by the recursion is attached.' },
    { id: 'done', label: 'Complete', description: 'Serialize the new maximum tree.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with arr (maximum tree, level order) and val (JSON)',
  url: 'https://leetcode.com/problems/maximum-binary-tree-ii/',
  complexity: 'O(h) time, where h is the height of the tree. Only the right spine is walked. The visualization caps the tree at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"arr":[4,1,3,null,null,2],"val":5}' },
    { label: 'Example 2', input: '{"arr":[5,2,4,null,1],"val":3}' },
    { label: 'Smallest', input: '{"arr":[5],"val":3}' },
  ],
}

export default function MaximumBinaryTreeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Maximum tree of arr" root={run.root} roles={roles} />
      {step.phase === 'done' && <BinaryTreeLane title="Maximum tree of arr + val" root={run.resultRoot} />}
      <output aria-label="Insertion">{`Inserting ${run.input.val} after ${run.input.arr.length} tree entries`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why only the right spine changes:</strong> val is the last element of the new array. Nodes larger than val keep their place, and the first node smaller than val becomes the left child of val.</p>
  </>} />
}
