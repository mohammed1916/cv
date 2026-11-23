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
  question: "Sum the power of every subsequence of length k, where the power of a subsequence is its smallest adjacent gap in sorted order, modulo 1000000007.",
  approaches: [
    { name: "Threshold counting by gap", intuition: "The power equals the sum of counts over every threshold up to the smallest gap, so each threshold is counted with dynamic programming.", time: "O(D * k * n^2)", space: "O(n * k)" },
  ],
  examples: [
    { label: 'Mixed signs, k three', input: '{"nums":[-7,12,3,-9,20],"k":3}' },
    { label: 'Eight values, k two', input: '{"nums":[8,-8,8,-1,0,6,-6,4],"k":2}' },
    { label: "Two values", input: "{\"nums\":[1,2],\"k\":2}" },
    { label: "Equal values", input: "{\"nums\":[3,3,3,3],\"k\":2}" },
    { label: "Negative values", input: "{\"nums\":[-1,-2,-3],\"k\":2}" },
    { label: "Extreme values, 10 entries", input: "{\"nums\":[-50,50,-50,50,-50,50,-50,50,-50,50],\"k\":10}" },
    { label: "Long run: 10 values", input: "{\"nums\":[-20,-19,-19,-46,20,31,-15,22,-27,-17],\"k\":6}" },
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
