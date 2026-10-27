import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the root level and an empty heap.' },
    { id: 'sum', label: 'Sum level', description: 'Add up the values on the current level.' },
    { id: 'push', label: 'Push', description: 'Push the level sum onto the heap.' },
    { id: 'pop', label: 'Trim', description: 'Remove the smallest sum when more than k are kept.' },
    { id: 'done', label: 'Complete', description: 'Report the kth largest level sum, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level-order array) and k (JSON)',
  url: 'https://leetcode.com/problems/kth-largest-sum-in-a-binary-tree/',
  complexity: 'O(n log k) time for n nodes. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"root":[5,8,9,2,1,3,7,4,6],"k":2}' },
    { label: 'Too few levels', input: '{"root":[1,2,null,3],"k":4}' },
  ],
}

export default function KthLargestLevelSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.nodeIds) roles[id] = 'active'
    return <>
      <BinaryTreeLane title="Tree (level sums)" root={run.root} roles={roles} />
      <IndexedSequence label="Level sums so far" length={step.sums.length} valueAt={i => step.sums[i]} active={step.sums.length - 1} />
      <output aria-label="Heap">{`Heap: [${step.heap.join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each level of the tree is summed in turn. The heap keeps the k largest sums seen so far, and its top is the smallest of those.</p>
    <p>When every level is done, the top of the heap is the kth largest sum. If the tree has fewer than k levels, the answer is -1.</p>
  </>} />
}
