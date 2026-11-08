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
  url: 'https://leetcode.com/problems/longest-balanced-subarray-ii/',
  complexity: 'O(n^2) subarrays with set updates. This trace scans every subarray directly, so it is a teaching model rather than the large-input solution.',
  examples: [
    { label: 'Whole array', input: '{"nums":[1,2,3,4]}' },
    { label: 'Mixed run', input: '{"nums":[2,5,4,3,8]}' },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[6,6,6]}' },
    { label: 'Alternating extremes', input: '{"nums":[100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1]}' },
    { label: 'Long run: 16 values', input: '{"nums":[53,16,67,38,69,92,43,34,97,12,35,50,97,80,3,66]}' },
  ],
}

export default function LongestBalancedSubarrayII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.start >= 0 && step.at >= 0 && i === step.start ? 'l' : step.start >= 0 && step.at >= 0 && i === step.at ? 'r' : step.start >= 0 && step.at >= 0 && i > step.start && i < step.at ? 'window' : '')} />
    <div className="algorithm-sets" aria-label="Distinct values in the window">
      <p>{`Distinct evens: ${step.evens && step.evens.length ? step.evens.join(', ') : 'none'}`}</p>
      <p>{`Distinct odds: ${step.odds && step.odds.length ? step.odds.join(', ') : 'none'}`}</p>
    </div>
    <output aria-label="Balance state">{`start ${step.start >= 0 ? step.start : 'none'}, best ${step.best}, ${step.ok === false ? 'unbalanced' : step.ok ? 'balanced' : 'scanning'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every subarray is considered by fixing its start (left pointer) and growing its end (right pointer), keeping a set of distinct evens and a set of distinct odds.</p>
    <p>Repeated values do not change the distinct counts, so only the first occurrence of each value matters.</p>
  </>} />
}
