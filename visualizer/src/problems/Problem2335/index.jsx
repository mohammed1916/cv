import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read how much water each cup still needs.' },
    { id: 'fill', label: 'Fill two', description: 'Fill the two cups with the most water still needed.' },
    { id: 'done', label: 'Complete', description: 'All cups are full.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with amount: three integers from 0 to 12',
  url: 'https://leetcode.com/problems/minimum-amount-of-time-to-fill-cups/',
  complexity: 'O(t) time for t seconds, which is at most the total water. The visualization caps each cup at 12.',
  examples: [
    { label: 'Example 1', input: '{"amount":[1,4,2]}' },
    { label: 'Example 2', input: '{"amount":[5,4,4]}' },
  ],
}

export default function FillCups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Cups (water still needed)" length={step.cups.length} valueAt={index => step.cups[index]} roleAt={index => (step.pair.includes(index) ? 'filled' : '')} />
    <output aria-label="Seconds">{`Seconds elapsed: ${step.second}`}</output>
  </>} renderReasoning={() => <>
    <p>Filling the two largest remaining amounts every second is optimal. Either the largest cup finishes first, or every second reduces the total by two.</p>
    <p>That makes the answer the larger of the largest cup and the ceiling of half the total.</p>
  </>} />
}
