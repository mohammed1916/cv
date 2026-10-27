import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no perfect subtrees found.' },
    { id: 'measure', label: 'Measure', description: 'Measure each subtree from its leaves upward and test whether it is perfect.' },
    { id: 'done', label: 'Complete', description: 'Sort the perfect sizes and read position k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Level-order binary tree with k (JSON object with tree and k)',
  url: 'https://leetcode.com/problems/k-th-largest-perfect-subtree-size-in-binary-tree/',
  complexity: 'O(n log n) time for the sort and O(n) space. The visualization caps the tree at 15 nodes.',
  examples: [
    { label: 'Complete tree', input: '{"tree":[1,2,3,4,5,6,7],"k":2}' },
    { label: 'Chain', input: '{"tree":[1,null,2,null,3],"k":1}' },
  ],
}

export default function KthLargestPerfectSubtree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.perfectIds.forEach(id => { roles[id] = 'match' })
    if (step.current !== null) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Binary tree (subtree sizes)" root={run.root} roles={roles} tags={step.tags} />
      <IndexedSequence label="Perfect subtree sizes found" length={step.sizes.length} valueAt={index => step.sizes[index]} active={-1} />
      <output aria-label="Perfect sizes">{`Perfect subtrees found: ${step.perfectIds.length}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A perfect subtree has every leaf at one depth and every other node with exactly two children. Measuring each subtree from the leaves up tests this in a single pass.</p>
    <p>The answer is the k-th largest size among the perfect subtrees, or -1 when there are fewer than k of them.</p>
  </>} />
}
