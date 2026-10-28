import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Put the numbers in ascending order.' },
    { id: 'gap', label: 'Neighbour gap', description: 'Measure the difference between two neighbouring values.' },
    { id: 'better', label: 'Smaller gap', description: 'This gap beats the best one so far.' },
    { id: 'done', label: 'Complete', description: 'The smallest neighbour gap is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (2 to 12 positive integers)',
  url: 'https://leetcode.com/problems/find-the-value-of-the-partition/',
  complexity: 'O(n log n) time for the sort, O(n) extra space for the sorted copy.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,2,4]}' },
    { label: 'Example 2', input: '{"nums":[100,1,10]}' },
  ],
}

export default function FindValueOfPartition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const pair = step.i >= 1 ? [step.i - 1, step.i] : []
    return <>
      <IndexedSequence label="Sorted numbers" length={run.sorted.length} valueAt={i => run.sorted[i]} active={step.i}
        roleAt={i => (pair.includes(i) ? 'pair' : '')} />
      <output aria-label="Best gap">{`Best gap so far: ${step.best ?? 'none yet'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>The split that minimises max(nums1) - min(nums2) puts a boundary between two neighbouring sorted values.</p>
    <p>So checking every neighbouring pair after sorting is enough.</p>
  </>} />
}
