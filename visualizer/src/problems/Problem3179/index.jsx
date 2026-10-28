import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ones', description: 'Every position starts with the value 1.' },
    { id: 'update', label: 'Running total', description: 'Each position takes the running total of the values before it.' },
    { id: 'done', label: 'Complete', description: 'Report the last value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and k (JSON)',
  url: 'https://leetcode.com/problems/find-the-n-th-value-after-k-seconds/',
  complexity: 'O(n * k) time and O(n) space. The visualization caps n and k at 30.',
  examples: [
    { label: 'Example 1', input: '{"n":4,"k":5}' },
    { label: 'Example 2', input: '{"n":5,"k":3}' },
  ],
}

export default function NthValueAfterKSeconds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={step.a.length} valueAt={i => step.a[i]} active={step.index} roleAt={i => (i === step.index ? 'updated' : '')} />
    <output aria-label="Second">{`Second ${step.second} of ${run.input.k}`}</output>
  </>} renderReasoning={() => <>
    <p>After one second, each position holds the sum of all values up to it. Repeating this k times makes the last position a binomial coefficient.</p>
    <p>Updating in place from left to right works because index i-1 already holds its new running total when index i reads it.</p>
  </>} />
}
