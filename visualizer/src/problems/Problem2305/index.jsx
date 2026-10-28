import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every child starts with an empty bag total.' },
    { id: 'give', label: 'Give', description: 'Hand this bag to one child and recurse.' },
    { id: 'prune', label: 'Prune', description: 'This child cannot beat the best unfairness, so skip it.' },
    { id: 'leaf', label: 'Leaf', description: 'All bags are placed, so compare the unfairness.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest possible unfairness.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with cookies (bag sizes) and k (JSON)',
  url: 'https://leetcode.com/problems/fair-distribution-of-cookies/',
  complexity: 'O(k^n) worst case for n bags and k children, pruned by the best answer so far. The visualization caps n at 8 and k at 4.',
  examples: [
    { label: 'Example 1', input: '{"cookies":[8,15,10,20,8],"k":2}' },
    { label: 'Example 2', input: '{"cookies":[6,1,3,2,2,4,1,2],"k":3}' },
  ],
}

export default function FairCookies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Child totals" length={run.input.k} active={step.child}
      valueAt={index => step.totals[index]} roleAt={index => (index === step.child ? 'target' : '')} />
    <output aria-label="Best unfairness">{`Best so far: ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Bags are assigned one at a time. Any branch whose child total already reaches the best unfairness cannot improve it, so it is pruned.</p>
    <p>The unfairness of a full assignment is the largest child total, and the answer is the smallest such value.</p>
  </>} />
}
