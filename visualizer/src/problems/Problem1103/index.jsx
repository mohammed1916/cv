import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the totals and the first gift of 1.' },
    { id: 'give', label: 'Give', description: 'Hand the next gift to the current person, capped by the candies left.' },
    { id: 'done', label: 'Complete', description: 'Report every person’s total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with candies and numPeople',
  url: 'https://leetcode.com/problems/distribute-candies-to-people/',
  complexity: 'O(sqrt(candies) + numPeople) time for the gifts. The visualization caps candies at 100.',
  examples: [
    { label: 'Example 1', input: '{"candies":7,"numPeople":4}' },
    { label: 'Example 2', input: '{"candies":10,"numPeople":3}' },
  ],
}

export default function DistributeCandies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Candies per person" length={run.input.numPeople} valueAt={i => step.totals[i]}
      active={step.person} indexOffset={0} roleAt={i => (i === step.person ? 'receiving' : '')} />
    <output aria-label="Candies left">{`Candies left: ${step.left}`}</output>
  </>} renderReasoning={() => <>
    <p>Gift t is the number t, given to the people in a cycle. The last gift is cut short if the candies run out.</p>
    <p>Each person’s total is the sum of their gifts, which is why the cut-short gift goes to whoever is next in the cycle.</p>
  </>} />
}
