import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the original parents.' },
    { id: 'climb', label: 'Climb', description: 'Walk up the ancestors of a node.' },
    { id: 'change', label: 'Re-parent', description: 'Move the node under a same-letter ancestor.' },
    { id: 'size', label: 'Sizes', description: 'Add each subtree into its new parent.' },
    { id: 'done', label: 'Result', description: 'Report every subtree size.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with parent (parent[0] = -1, parents come earlier) and s (letters a to e)',
  url: 'https://leetcode.com/problems/find-subtree-sizes-after-changes/',
  complexity: 'O(n * h) time for the ancestor walks, O(n) space. The visualization caps the tree at 10 nodes.',
  examples: [
    { label: 'Example', input: '{"parent":[-1,0,1],"s":"aba"}' },
    { label: 'Chain', input: '{"parent":[-1,0,1,2],"s":"aaaa"}' },
  ],
}

export default function SubtreeSizesAfterChanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node >= 0) roles[step.node] = 'focus'
    if (step.y >= 0) roles[step.y] = 'target'
    return <>
      <RootedTreeDiagram root={run.root} roles={roles} title="Original tree (node ids)" />
      <output aria-label="Subtree sizes">{step.sizes ? `Sizes: [${step.sizes.join(', ')}]` : step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>A node's new parent is its nearest ancestor with the same letter; if there is none, it keeps its original parent.</p>
    <p>Parents always have smaller indices than their children, so adding sizes from the highest index down finishes each subtree before it is used.</p>
  </>} />
}
