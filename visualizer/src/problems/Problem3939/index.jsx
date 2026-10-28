import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the last node index.' },
    { id: 'node', label: 'Node', description: 'Combine this node with its children, tracking remainders mod k.' },
    { id: 'done', label: 'Return', description: 'Remove the empty set from the root totals.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"parent": [...], "nums": [...], "k": k}',
  url: 'https://leetcode.com/problems/count-non-adjacent-subsets-in-a-rooted-tree/',
  complexity: 'O(n * k^2) time with the remainder tables, and O(n * k) space. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"parent":[-1,0,1],"nums":[1,2,3],"k":3}' },
    { label: 'Example 2', input: '{"parent":[-1,0,0,0],"nums":[2,1,2,1],"k":3}' },
  ],
}

export default function NonAdjacentSubsetsTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Node values" length={run.input.nums.length} valueAt={j => run.input.nums[j]} active={step.node ?? -1} />
    <output aria-label="Remainder counts">{`Remainder counts (without node) for the current node: [${step.sums.join(', ')}]`}</output>
    <output aria-label="Step message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A node and its parent cannot both be chosen, so each node keeps two tables: one for when it is chosen and one for when it is not.</p>
    <p>Children are always later in the index order than their parents, so a single pass from the last index to the root sees every child first.</p>
  </>} />
}
