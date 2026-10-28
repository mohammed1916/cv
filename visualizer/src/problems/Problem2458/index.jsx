import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare to measure subtrees.' },
    { id: 'height', label: 'Subtree heights', description: 'Measure each subtree from the bottom up.' },
    { id: 'answer', label: 'Answers', description: 'Work out the height left after removing each node, from the top down.' },
    { id: 'query', label: 'Queries', description: 'Read the answer for each queried subtree.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root (level order, distinct values 1 to n) and queries (JSON)',
  url: 'https://leetcode.com/problems/height-of-binary-tree-after-subtree-removal-queries/',
  complexity: 'O(n) time for all queries after one pass. The visualization caps the tree at 15 nodes.',
  examples: [
    { label: 'Five nodes', input: '{"root":[1,2,3,4,5],"queries":[2,4,3,1]}' },
    { label: 'Chain', input: '{"root":[1,null,2,null,3],"queries":[2,3]}' },
  ],
}

export default function SubtreeRemovalHeight() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.removed.forEach(id => { roles[id] = 'pruned' })
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree with answers" root={run.root} roles={roles} tags={step.tags} />
      <output aria-label="Answers so far">{step.result ? `Answers so far: [${step.result.join(', ')}]` : step.message}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Removing a subtree leaves the rest of the tree, and its height is the larger of two parts: the height above the removed node's parent, and the deepest path through the parent that avoids the removed child.</p>
    <p>Filling these answers from the top down reuses the answer of each parent, so every query is one lookup.</p>
  </>} />
}
