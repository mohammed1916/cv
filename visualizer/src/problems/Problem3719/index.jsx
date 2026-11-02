import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No balanced subarray is known yet.' },
    { id: 'window', label: 'Start index', description: 'Begin with empty even and odd sets.' },
    { id: 'extend', label: 'Extend', description: 'Add the next value to the matching set.' },
    { id: 'check', label: 'Check', description: 'Compare the distinct even and odd counts.' },
    { id: 'update', label: 'Update', description: 'Keep the longer balanced subarray.' },
    { id: 'done', label: 'Result', description: 'Report the longest balanced length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers)',
  url: 'https://leetcode.com/problems/longest-balanced-subarray-i/',
  complexity: 'O(n^2) subarrays with set updates. The visualization caps nums at 16 values.',
  examples: [
    { label: 'Whole array', input: '{"nums":[1,2,3,4]}' },
    { label: 'Mixed run', input: '{"nums":[2,5,4,3,8]}' },
  ],
}

export default function LongestBalancedSubarrayI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.start >= 0 && step.at >= 0 && i >= step.start && i <= step.at ? 'window' : '')} />
    <output aria-label="Balance state">{`start ${step.start >= 0 ? step.start : 'none'}, best ${step.best}, ${step.ok === false ? 'unbalanced' : step.ok ? 'balanced' : 'scanning'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every subarray is considered by fixing its start and growing its end, keeping a set of distinct evens and a set of distinct odds.</p>
    <p>Repeated values do not change the distinct counts, so only the first occurrence of each value matters.</p>
  </>} />
}
