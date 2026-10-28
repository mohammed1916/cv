import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count letters', description: 'Count how many times each letter appears in s.' },
    { id: 'step', label: 'Transform round', description: 'Every letter moves one place forward, and z becomes a and b.' },
    { id: 'done', label: 'Complete', description: 'Add up the counts to get the length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters) and t (JSON)',
  url: 'https://leetcode.com/problems/total-characters-in-string-after-transformations-i/',
  complexity: 'O(t * 26) time and O(26) space. The visualization caps s at 20 letters and t at 20 rounds.',
  examples: [
    { label: 'Example 1', input: '{"s":"abcyy","t":2}' },
    { label: 'Example 2', input: '{"s":"azbk","t":1}' },
  ],
}

export default function TotalCharactersI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Count of each letter (0 = a, 25 = z)" length={26} valueAt={index => step.counts[index]}
      roleAt={index => (step.counts[index] > 0 ? 'present' : '')} />
    <output aria-label="Length">{`Round ${step.step} of ${run.input.t}. Length: ${step.length}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the count of each letter matters, not the order of the letters. Each round, a count moves to the next letter.</p>
    <p>The letter z produces both a and b, so its count is added to both of those letters.</p>
  </>} />
}
