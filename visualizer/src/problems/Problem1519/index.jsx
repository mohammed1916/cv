import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Root the tree at node 0.' },
    { id: 'climb', label: 'Subtree counts', description: 'Combine child letter counts and read the count for this node’s label.' },
    { id: 'done', label: 'Complete', description: 'Report the count for every node.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree with n nodes, n-1 edges and lowercase labels (JSON object)',
  url: 'https://leetcode.com/problems/number-of-nodes-in-the-sub-tree-with-the-same-label/',
  complexity: 'O(n * 26) time and O(n * 26) space. The visualization caps the tree at 12 nodes.',
  examples: [
    { label: 'Example 1', input: '{"n":7,"edges":[[0,1],[0,2],[1,4],[1,5],[2,3],[2,6]],"labels":"abaedcd"}' },
    { label: 'Star', input: '{"n":4,"edges":[[0,1],[0,2],[0,3]],"labels":"aaaa"}' },
  ],
}

export default function SameLabelSubtree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.current !== null) roles[step.current] = 'focus'
    return <>
      <RootedTreeDiagram title="Tree, rooted at node 0" root={run.tree} roles={roles} />
      <IndexedSequence label="Same-label count per node" length={run.labels.length}
        valueAt={index => step.answer[index] ?? '-'} active={step.current ?? -1}
        roleAt={index => (step.answer[index] !== null ? 'set' : '')} />
      <output aria-label="Current label">{step.current !== null ? `Node ${step.current} has label ${run.labels[step.current]}` : 'Labels read from the input'}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each subtree keeps a count of each letter. After combining its children, the count for its own label is the answer for that node.</p>
    <p>Visiting children before parents means each count is complete before it is read.</p>
  </>} />
}
