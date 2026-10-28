import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Try each cap from 1 to n.' },
    { id: 'cap', label: 'Cap', description: 'Cap every element, then check whether a subsequence reaches k.' },
    { id: 'done', label: 'Complete', description: 'Report one boolean per cap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and k',
  url: 'https://leetcode.com/problems/subsequence-sum-after-capping-elements/',
  complexity: 'O(n^2 k) time with the subset-sum table for each cap. The visualization caps n at 20 and k at 200.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,3,2,4],"k":5}' },
    { label: 'Example 2', input: '{"nums":[1,2,3,4,5],"k":3}' },
  ],
}

export default function CappedSubsetSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, k } = run.input
    const roleAt = i => (Math.min(nums[i], step.cap) === nums[i] ? '' : 'capped')
    return <>
      <IndexedSequence label="nums" length={nums.length} valueAt={i => Math.min(nums[i], step.cap || nums[i])} roleAt={roleAt} />
      <output aria-label="Cap">{`Cap ${step.cap || '-'} of ${nums.length}; target sum ${k}${step.answer === null ? '' : `: ${step.answer ? 'reachable' : 'not reachable'}`}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A cap x replaces each value with the smaller of the value and x. Only the capped values matter for the subset-sum check.</p>
    <p>For each cap, a table of reachable sums is built one value at a time, going down from k so that each value is used at most once.</p>
  </>} />
}
