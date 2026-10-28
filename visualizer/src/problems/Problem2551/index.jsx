import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'pairs', label: 'Cut costs', description: 'A cut between two neighbours adds their two weights to the score.' },
    { id: 'sort', label: 'Sort costs', description: 'Order the cut costs from cheapest to most expensive.' },
    { id: 'low', label: 'Cheapest', description: 'The k minus 1 cheapest cuts give the lowest score.' },
    { id: 'high', label: 'Priciest', description: 'The k minus 1 most expensive cuts give the highest score.' },
    { id: 'done', label: 'Complete', description: 'The answer is the highest score minus the lowest score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with weights and k (number of bags)',
  url: 'https://leetcode.com/problems/put-marbles-in-bags/',
  complexity: 'O(n log n) time for the sort, O(n) space for the cut costs.',
  examples: [
    { label: 'Example 1', input: '{"weights":[1,3,5,1],"k":2}' },
    { label: 'Example 2', input: '{"weights":[1,3],"k":2}' },
  ],
}

export default function PutMarblesInBags() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const shown = step.sorted ?? step.pairs
    const need = run.input.k - 1
    return <>
      <IndexedSequence label={step.sorted ? 'Cut costs, sorted' : 'Cut costs, in order'} length={shown.length} valueAt={i => shown[i]}
        roleAt={i => (step.sorted && i < need ? 'low' : step.sorted && i >= shown.length - need ? 'high' : '')} />
      <output aria-label="Score spread">{`Lowest score: ${step.low ?? 'not yet'}. Highest score: ${step.high ?? 'not yet'}.`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A bag scores its first and last marble weights, so each cut between neighbours adds a fixed pair sum no matter which other cuts exist.</p>
    <p>The highest score takes the k minus 1 largest cut costs and the lowest takes the smallest, so the answer is their difference.</p>
  </>} />
}
