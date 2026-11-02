import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Collect the values of nums and start at k.' },
    { id: 'check', label: 'Check', description: 'Is the candidate multiple present?' },
    { id: 'step', label: 'Next', description: 'Move to the next multiple of k.' },
    { id: 'done', label: 'Result', description: 'Report the first missing multiple.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers) and k',
  url: 'https://leetcode.com/problems/smallest-missing-multiple-of-k/',
  complexity: 'O(n + m) where m is the answer divided by k. The visualization caps nums at 20 values.',
  examples: [
    { label: 'Gap at 2', input: '{"nums":[3,4,6,8],"k":2}' },
    { label: 'Skip to 6', input: '{"nums":[2,4,3],"k":2}' },
  ],
}

export default function SmallestMissingMultipleOfK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (run.input.nums[i] === step.m ? 'candidate' : '')} />
    <output aria-label="Candidate multiple">{`k = ${run.input.k}, candidate ${step.m}, ${step.ok === false ? 'missing' : step.ok ? 'present' : 'checking'}`}</output>
  </>} renderReasoning={() => <>
    <p>The answer is a multiple of k, so only the multiples k, 2k, 3k, ... need checking, in increasing order.</p>
    <p>A set makes each membership test constant time, and the first multiple that is absent is the smallest one.</p>
  </>} />
}
