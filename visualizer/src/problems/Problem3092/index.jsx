import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyComparison from '../../components/shared/FrequencyComparison'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The collection starts empty.' },
    { id: 'step', label: 'Apply step', description: 'Add or remove copies of one ID, then read the largest count.' },
    { id: 'done', label: 'Complete', description: 'Report the answer for every step.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: { "nums": IDs, "freq": signed changes }',
  url: 'https://leetcode.com/problems/most-frequent-ids/',
  complexity: 'O(n * log n) with a heap, or O(n) expected with a count map and a count-of-counts table.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,2,1],"freq":[3,2,-3,1]}' },
    { label: 'Example 2', input: '{"nums":[5,5,3],"freq":[2,-2,1]}' },
  ],
}

export default function MostFrequentIds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Step ID" length={run.input.nums.length} valueAt={i => `${run.input.nums[i]} ${run.input.freq[i] > 0 ? '+' : ''}${run.input.freq[i]}`} active={step.index} roleAt={i => (i < step.index ? 'applied' : '')} />
    <FrequencyComparison leftTitle="Counts now" rightTitle="Counts before" left={step.counts} right={step.before} />
    <output aria-label="Answers so far">{`Answers so far: [${step.answer.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Each step changes one ID by a known amount, so a running count per ID is enough.</p>
    <p>An ID whose count returns to zero must leave the table, otherwise it would still be considered as a maximum.</p>
  </>} />
}
