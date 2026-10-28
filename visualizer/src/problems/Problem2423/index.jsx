import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyComparison from '../../components/shared/FrequencyComparison'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how often each letter appears.' },
    { id: 'try', label: 'Try a removal', description: 'Remove one copy of a letter and check the remaining counts.' },
    { id: 'done', label: 'Complete', description: 'Report whether one removal is enough.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase word as a JSON string',
  url: 'https://leetcode.com/problems/remove-letter-to-equalize-frequency/',
  complexity: 'O(n * 26) time and O(26) space.',
  examples: [
    { label: 'Example 1', input: '"abcc"' },
    { label: 'Example 2', input: '"aazz"' },
  ],
}

export default function RemoveLetterToEqualizeFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Word" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => (step.letter === run.input[i] ? 'tried' : '')} />
    <FrequencyComparison leftTitle="Counts now" rightTitle="Counts before" left={step.counts} right={run.frames[0].counts} />
  </>} renderReasoning={() => <>
    <p>Removing one letter only changes that letter&apos;s count by one, so trying each distinct letter once is enough.</p>
    <p>Letters whose count drops to zero are no longer present, so they are ignored when comparing.</p>
  </>} />
}
