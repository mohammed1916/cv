import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Roots', description: 'Start with both roots.' },
    { id: 'merge', label: 'Merge node', description: 'Add values where both nodes exist.' },
    { id: 'done', label: 'Complete', description: 'Return the merged tree.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Two trees (JSON object with a and b)',
  url: 'https://leetcode.com/problems/merge-two-binary-trees/',
  complexity: 'O(min(m, n)) time, where m and n are the node counts; the merged tree reuses the non-overlapping subtrees.',
  examples: [
    { label: 'Example', input: '{"a":[1,3,2,5],"b":[2,1,3,null,4,null,7]}' },
    { label: 'Single node', input: '{"a":[1],"b":[1,2]}' },
    { label: 'Empty', input: '{"a":[],"b":[1]}' },
  ],
}

export default function MergeTrees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <BinaryTreeLane title="Merged tree" root={run.root} roles={step.current !== null && step.current !== undefined ? { [step.current]: 'active' } : {}} />
    <output aria-label="Merged level order">[{run.result.map(v => (v === null ? 'null' : v)).join(', ')}]</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Shared shape:</strong> nodes that exist in both trees are summed; a missing node on either side means the other subtree is used unchanged.</p>
  </>} />
}
