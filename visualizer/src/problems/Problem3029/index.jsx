import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RevertStrips from './RevertStrips'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with one second.' },
    { id: 'miss', label: 'Miss', description: 'The remaining letters do not match the start.' },
    { id: 'match', label: 'Match', description: 'The remaining letters match the start of the word.' },
    { id: 'free', label: 'Free', description: 'Every original letter has been removed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with word (lowercase, 1 to 50 letters) and k (1 to the word length)',
  url: 'https://leetcode.com/problems/minimum-time-to-revert-word-to-initial-state-i/',
  complexity: 'O(n^2) time in the worst case with direct string comparison, where n is the word length.',
  examples: [
    { label: 'Example 1', input: '{"word":"abacaba","k":3}' },
    { label: 'Example 2', input: '{"word":"abacaba","k":4}' },
    { label: 'Example 3', input: '{"word":"abcbabcd","k":2}' },
  ],
}

export default function RevertWordI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RevertStrips word={run.input.word} t={step.t} k={run.input.k} rest={step.rest} prefix={step.prefix} />
    <output aria-label="Second being tested">{`t = ${step.t}, removed ${step.cut ?? 0} letters of ${run.input.word.length}`}</output>
    <output aria-label="Remaining letters and start">{step.rest !== undefined ? `remaining "${step.rest}" against start "${step.prefix}"` : 'no comparison yet'}</output>
  </>} renderReasoning={() => <>
    <p>After t seconds the first t times k letters are gone. The word can be restored when the letters left behind equal the start of the word, because the appended letters are free.</p>
    <p>Once t times k reaches the word length, nothing remains to compare, so the answer is t.</p>
  </>} />
}
