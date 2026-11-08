import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyComparison from '../../components/shared/FrequencyComparison'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only even values will be counted.' },
    { id: 'count', label: 'Count even', description: 'Add one to the count of this even value.' },
    { id: 'best', label: 'New best', description: 'This even value now leads the counts.' },
    { id: 'done', label: 'Complete', description: 'Report the answer or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers 0 to 100 as a JSON array',
  url: 'https://leetcode.com/problems/most-frequent-even-element/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Repeated maximum', input: '[5,11,2,11,9]' },
    { label: 'Example 2', input: '[1,3,5]' },
    { label: 'Eight values', input: '[24,40,6,18,12,9,30,3]' },
    { label: 'Single zero', input: '[0]' },
    { label: 'Repeated values', input: '[7,7,7,7]' },
    { label: 'Extremes, 20 values', input: '[100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0]' },
    { label: 'Long run: 20 values', input: '[19,6,76,99,46,99,14,62,95,92,96,88,54,84,21,78,7,17,7,63]' },
  ],
}

export default function MostFrequentEvenElement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => (run.input[i] % 2 === 0 ? 'even' : 'skipped')} />
    <FrequencyComparison leftTitle="Even counts" rightTitle="Best" left={step.counts} right={step.best === -1 ? {} : { [step.best]: step.counts[step.best] ?? 0 }} />
    <output aria-label="Best even so far">{`Best even so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Odd values can never be the answer, so they are skipped before counting.</p>
    <p>Ties are broken by the smaller value, which is why candidates are compared on both count and value.</p>
  </>} />
}
