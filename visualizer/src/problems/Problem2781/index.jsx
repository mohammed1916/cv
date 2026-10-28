import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set left and best to zero.' },
    { id: 'extend', label: 'Extend', description: 'Move the right edge one letter.' },
    { id: 'done', label: 'Complete', description: 'Return the best length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "word" (lowercase letters) and "forbidden" (list of strings), JSON',
  url: 'https://leetcode.com/problems/length-of-the-longest-valid-substring/',
  complexity: 'O(n times k times L) time for n letters, k forbidden strings and maximum length L. The visualization caps input at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"cbaaaabc","forbidden":["aaa","cb"]}' },
    { label: 'Example 2', input: '{"word":"leetcode","forbidden":["de","le","e"]}' },
  ],
}

export default function LengthOfTheLongestValidSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='word' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>A substring is valid when no forbidden string appears in it, so the left edge only ever needs to move right.</p>
    <p>Only forbidden strings that end at the current right edge can newly break the window.</p>
  </>} />
}
