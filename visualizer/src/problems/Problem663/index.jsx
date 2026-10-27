import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'visit', label: 'Sum subtrees', description: 'Each node gets the sum of its own subtree, children first.' },
    { id: 'done', label: 'Decide', description: 'Look for a non-root subtree that sums to half the total.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Tree (JSON level order)',
  url: 'https://leetcode.com/problems/equal-tree-partition/',
  complexity: 'O(n) time and O(h) stack space. The visualization caps input at 30 nodes.',
  examples: [
    { label: 'Example 1', input: '[5,10,10,null,null,2,3]' },
    { label: 'Example 2', input: '[1,2,10]' },
  ],
}

export default function EqualTreePartition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.visited) roles[id] = 'visited'
    if (step.node !== null) roles[step.node] = 'active'
    const tags = Object.fromEntries(Object.entries(step.sums).map(([id, sum]) => [id, `sum ${sum}`]))
    return <>
      <BinaryTreeLane title="Tree with subtree sums" root={run.root} roles={roles} tags={tags}
        note={step.total === null ? undefined : `total ${step.total}`} />
      <output aria-label="Result">{step.result === null ? 'Deciding after the walk' : `Equal partition possible: ${step.result}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Removing the edge above a node splits the tree into that subtree and the rest. The two sums are equal exactly when the subtree sums to half the total.</p>
    <p>The root itself is excluded, since cutting nothing above it does not split the tree.</p>
  </>} />
}
