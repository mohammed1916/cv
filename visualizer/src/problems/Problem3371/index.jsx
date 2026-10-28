import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Add up every element of nums.' },
    { id: 'candidate', label: 'Candidates', description: 'Test each value as the outlier.' },
    { id: 'done', label: 'Complete', description: 'Report the largest possible outlier.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array nums with one outlier (JSON object)',
  url: 'https://leetcode.com/problems/identify-the-largest-outlier-in-an-array/',
  complexity: 'O(n log n) time for the sorted candidates, O(n) space for the counts. The visualization caps input at 30 values.',
  examples: [
    { label: 'Outlier 10', input: '{"nums":[2,3,5,10]}' },
    { label: 'Negative values', input: '{"nums":[-2,-1,-3,-6,4]}' },
  ],
}

export default function LargestOutlier() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    return <>
      <IndexedSequence label="Values" length={nums.length} valueAt={i => nums[i]} active={-1} roleAt={i => (nums[i] === step.key ? 'candidate' : '')} />
      <FrequencyCountTable title="Value counts" entries={step.counts} active={step.key} />
      <output aria-label="Outlier check">{`Total ${step.total}. ${step.key === null ? `Best so far: ${step.best ?? 'none'}` : step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>If x is the outlier, the other values are the special numbers plus one sum value, and they sum to exactly twice that sum value.</p>
    <p>So each candidate needs only an even remainder and a matching value present among the rest.</p>
  </>} />
}
