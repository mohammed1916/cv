import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the values and list the possible smallest gaps.' },
    { id: 'threshold', label: 'Threshold', description: 'Count subsequences whose gaps are all at least this threshold.' },
    { id: 'done', label: 'Complete', description: 'Report the total modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values and size (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/find-the-sum-of-subsequence-powers/',
  complexity: 'O(D * k * n^2) time, where D is the number of distinct gaps. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4],"k":3}' },
    { label: 'Example 2', input: '{"nums":[4,3,-1],"k":2}' },
  ],
}

export default function SubsequencePowers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted values" length={step.sorted.length} valueAt={i => step.sorted[i]} active={-1} />
    <output aria-label="Running total">{step.threshold === null ? `Running total: ${step.total}` : `Threshold ${step.threshold}: ${step.count} subsequences, running total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The power of a subsequence is its smallest gap, so it equals the sum of the weights of every threshold up to that gap.</p>
  </>} />
}
