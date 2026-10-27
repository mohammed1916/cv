import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'order', label: 'Root', description: 'Root the tree at node 0 and handle children before parents.' },
    { id: 'leaf', label: 'Leaf', description: 'A leaf must keep its own value.' },
    { id: 'choose', label: 'Choose', description: 'Keep this node, or keep the cheaper cover of its children.' },
    { id: 'done', label: 'Complete', description: 'Subtract the kept value from the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree edges and node values 1 to 20 (JSON object)',
  url: 'https://leetcode.com/problems/maximum-score-after-applying-operations-on-a-tree/',
  complexity: 'O(n) time and O(n) space. The visualization caps the tree at 10 nodes.',
  examples: [
    { label: 'Star', input: '{"edges":[[0,1],[0,2]],"values":[5,1,1]}' },
    { label: 'Path', input: '{"edges":[[0,1],[1,2]],"values":[1,1,1]}' },
  ],
}

export default function MaximumScoreAfterOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.current !== null) roles[step.current] = 'focus'
    return <>
      <RootedTreeDiagram title="Tree, rooted at node 0" root={run.tree} roles={roles} />
      <IndexedSequence label="Best kept value per node" length={run.values.length}
        valueAt={index => step.best[index] ?? '-'} active={step.current ?? -1}
        roleAt={index => (step.best[index] !== null ? 'set' : '')} />
    </>
  }} renderReasoning={() => <>
    <p>Every leaf path must keep some positive value. Keeping a node covers every path through it, so the choice is either keep this node, or cover each child subtree separately.</p>
    <p>The score is the total of all values minus the smallest total that must be kept.</p>
  </>} />
}
