import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Set the search bounds from the smallest coin and k.' },
    { id: 'probe', label: 'Count amounts', description: 'Count amounts up to the candidate using inclusion-exclusion over coin groups.' },
    { id: 'done', label: 'Answer', description: 'Report the k-th smallest amount.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with coins (1 to 8 values, 1 to 25) and k (1 to 60) (JSON)',
  url: 'https://leetcode.com/problems/kth-smallest-amount-with-single-denomination-combination/',
  complexity: 'O(log(min coin * k) * 2^c) time for c coins. The visualization caps c at 8.',
  examples: [
    { label: 'Own case 1', input: '{"coins":[4,7,10],"k":4}' },
    { label: 'Own case 2', input: '{"coins":[6,3],"k":8}' },
    { label: "Single coin type", input: "{\"coins\":[1],\"k\":60}" },
    { label: "Equal coins", input: "{\"coins\":[4,4,4],\"k\":8}" },
    { label: "Largest coins and k", input: "{\"coins\":[25,24,23,22,21,20,19,18],\"k\":60}" },
    { label: "Unreachable target", input: "{\"coins\":[5,10],\"k\":7}" },
    { label: "Long run: 8 coin types", input: "{\"coins\":[3,21,1,20,2,4,14,23],\"k\":45}" },
  ],
}

export default function KthSmallestAmount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Amount search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <output aria-label="Amounts up to the candidate">{step.count === null ? 'Count not started' : `Amounts up to ${step.mid ?? step.lo}: ${step.count}, target k = ${run.input.k}`}</output>
  </>} renderReasoning={() => <>
    <p>Each coin can only make its own multiples, so the amounts are the union of several arithmetic progressions.</p>
    <p>The union is counted by adding the multiples of each group of coins with the sign that inclusion-exclusion gives, which makes the count monotone and allows binary search.</p>
  </>} />
}
