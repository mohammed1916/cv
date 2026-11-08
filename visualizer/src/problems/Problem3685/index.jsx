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
    { label: 'Example 1', input: '{"nums":[6,1,5,2],"k":6}' },
    { label: 'Example 2', input: '{"nums":[9,4,4,7],"k":8}' },
    { label: 'Single value', input: '{"nums":[5],"k":5}' },
    { label: 'Equal values share a cap', input: '{"nums":[3,3,3,3],"k":6}' },
    { label: 'Largest values allowed', input: '{"nums":[1000000000,1000000000],"k":200}' },
    { label: 'No subset reaches k', input: '{"nums":[7,9],"k":5}' },
    { label: 'Long run: 20 values', input: '{"nums":[33,24,55,18,37,8,27,18,29,48,51,46,13,8,55,42,9,24,23,58],"k":200}' },
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
