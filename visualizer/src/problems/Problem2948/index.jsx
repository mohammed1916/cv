import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Order the indices by value.' },
    { id: 'collect', label: 'Group', description: 'Values within the limit of their neighbour share a group.' },
    { id: 'write', label: 'Write', description: 'Write the group values back in ascending order.' },
    { id: 'done', label: 'Result', description: 'The smallest reachable array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [9,3,7,4,8], "limit": 2}',
  url: 'https://leetcode.com/problems/make-lexicographically-smallest-array-by-swapping-elements/',
  complexity: 'O(n log n) time for sorting and grouping, O(n) extra space. The visualization caps the array at 10 values.',
  examples: [
    { label: 'Two groups', input: '{"nums":[9,3,7,4,8],"limit":2}' },
    { label: 'One chain', input: '{"nums":[4,12,9,2],"limit":5}' },
  ],
}

export default function LexicographicallySmallestArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Original values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1}
      roleAt={i => (step.group.includes(i) ? `group ${step.groupId}` : '')} />
    <IndexedSequence label="Current array" length={step.result.length} valueAt={i => step.result[i]} active={-1}
      roleAt={i => (step.group.includes(i) ? 'written' : '')} />
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Two indices can trade values when their values differ by at most the limit, directly or through a chain. Each chain forms a group, and a group's values can be placed in any of its positions.</p>
    <p>Writing the sorted values of a group into its sorted positions gives the smallest array the group allows.</p>
  </>} />
}
