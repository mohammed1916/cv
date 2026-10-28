import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FrequencyComparison from '../../components/shared/FrequencyComparison'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how often each letter appears.' },
    { id: 'target', label: 'Try a target', description: 'Use the lowest allowed count and price the deletions.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest deletions found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: { "word": lowercase string, "k": integer 0 to 5 }',
  url: 'https://leetcode.com/problems/minimum-deletions-to-make-string-k-special/',
  complexity: 'O(n + m * d) time where m is the largest count and d the number of distinct letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"aabcaba","k":0}' },
    { label: 'Example 2', input: '{"word":"dabdcbdcdcd","k":2}' },
    { label: 'Example 3', input: '{"word":"aaabaaa","k":2}' },
  ],
}

export default function MinimumDeletionsKSpecial() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Word" length={run.input.word.length} valueAt={i => run.input.word[i]} />
    <FrequencyComparison leftTitle="Before" rightTitle="After this target" left={step.before} right={step.after} />
    <output aria-label="Fewest deletions so far">{`Target low: ${step.low ?? 'none yet'} · Fewest deletions: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>In a k-special word every kept letter count lies in one window of width k, so choose the window&apos;s lowest count as the target.</p>
    <p>Letters below the target must be deleted entirely, and letters above the window are trimmed down to its top.</p>
  </>} />
}
