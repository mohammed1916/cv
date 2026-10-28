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
    { label: 'Example 1', input: '[0,1,2,2,4,4,1]' },
    { label: 'Example 2', input: '[1,3,5]' },
    { label: 'Example 3', input: '[29,47,21,41,13,37,25,7]' },
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
