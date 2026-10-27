import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Set the candidate range from 1 to the largest value.' },
    { id: 'check', label: 'Candidate g', description: 'Check whether some subsequence has gcd exactly g.' },
    { id: 'done', label: 'Complete', description: 'Report how many candidates passed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON list of positive integers)',
  url: 'https://leetcode.com/problems/number-of-different-subsequences-gcds/',
  complexity: 'O(M log M) time for largest value M, after building the presence set. The visualization caps values at 30.',
  examples: [
    { label: 'Example 1', input: '{"nums":[6,10,3]}' },
    { label: 'Example 2', input: '{"nums":[5,15,40,5,6]}' },
  ],
}

export default function DifferentSubsequenceGcds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const largest = Math.max(...run.input.nums)
    return <>
      <IndexedSequence label="Candidate g (1 to largest)" length={largest} valueAt={i => i + 1} active={step.g - 1}
        roleAt={i => (step.achieved.includes(i + 1) ? 'achieved' : '')} />
      <output aria-label="Count">{`Achieved so far: ${step.achieved.join(', ') || 'none'}. Count ${step.count}.`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A value g is achieved by some subsequence exactly when the gcd of all array values divisible by g is g itself.</p>
    <p>Checking every candidate g up to the largest value counts each achievable gcd once.</p>
  </>} />
}
