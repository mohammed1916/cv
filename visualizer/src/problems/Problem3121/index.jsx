import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare the position maps.' },
    { id: 'upper', label: 'Uppercase', description: 'Record the first uppercase position.' },
    { id: 'lower', label: 'Lowercase', description: 'Record the last lowercase position.' },
    { id: 'count', label: 'Count', description: 'Compare the two positions.' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "word" (English letters), JSON',
  url: 'https://leetcode.com/problems/count-the-number-of-special-characters-ii/',
  complexity: 'O(n) time and O(1) extra space for 52 letters. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"aaAbcBC"}' },
    { label: 'Example 2', input: '{"word":"AbCabc"}' },
  ],
}

export default function CountTheNumberOfSpecialCharactersII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Characters of word' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>A letter is special exactly when its last lowercase position comes before its first uppercase position.</p>
    <p>Tracking first uppercase and last lowercase positions in one pass avoids comparing every occurrence.</p>
  </>} />
}
