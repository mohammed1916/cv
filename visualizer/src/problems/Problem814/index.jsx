import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the level-order tree.' },
    { id: 'visit', label: 'Descend', description: 'Enter a node before judging its children.' },
    { id: 'prune', label: 'Cut subtree', description: 'Remove a child subtree with no 1.' },
    { id: 'decide', label: 'Keep or drop', description: 'Report whether this subtree contains a 1.' },
    { id: 'done', label: 'Complete', description: 'Return the pruned tree.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Level-order tree (JSON)',
  url: 'https://leetcode.com/problems/binary-tree-pruning/',
  complexity: 'O(n) time and O(h) recursion space.',
  examples: [
    { label: 'Own case 1', input: '[1,0,0,null,1]' },
    { label: 'Own case 2', input: '[1,0,0,0,1,0,1]' },
    { label: 'Own case 3', input: '[0,1,0,1,1,0,1,1]' },
    { label: 'All zeros', input: '[0,0,0]' },
    { label: 'Single node', input: '[0]' },
    { label: 'Equal values', input: '[1,1,1]' },
    { label: 'Full tree with 31 nodes', input: '[1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]' },
    { label: 'Long run: random tree with nulls', input: '[0,null,0,0,null,1,1,0,0,null,1,null,1,0,null,1,1,null,1,null,0,1,0,null,null,1,0,null,0,0,null]' },
  ],
}
export default function BinaryTreePruning() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <BinaryTreeLane title="Tree (red = pruned)" root={run.display} roles={step.roles} tags={step.tags} />
    <IndexedSequence label="Current tree (level order)" length={step.treeShape.length} active={-1} valueAt={i => step.treeShape[i] === null ? 'null' : step.treeShape[i]} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why post-order:</strong> whether a subtree contains a 1 depends on its children, so the answer flows from the leaves upward, and a child is cut as soon as its subtree reports no 1.</p>
  </>} />
}
