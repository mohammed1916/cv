import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the end of the string.' },
    { id: 'trim', label: 'Trim', description: 'The character before the end is a vowel, so drop it.' },
    { id: 'done', label: 'Complete', description: 'Keep everything before the end.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s: 1 to 20 lowercase letters',
  url: 'https://leetcode.com/problems/trim-trailing-vowels/',
  complexity: 'O(n) time for a string of length n. The visualization caps s at 20 characters.',
  examples: [
    { label: 'Example', input: '{"s":"idea"}' },
    { label: 'No vowels at end', input: '{"s":"bcd"}' },
  ],
}

export default function TrimTrailingVowels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters of s" length={run.input.s.length} valueAt={index => run.input.s[index]} active={step.index} roleAt={index => (index >= step.end ? 'trimmed' : '')} />
    <output aria-label="Result">{`Kept so far: ${run.input.s.slice(0, step.end) || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the trailing run of vowels is removed, so the scan stops at the first character from the end that is not a vowel.</p>
    <p>Vowels in the middle of the string are never touched because they are not part of the trailing run.</p>
  </>} />
}
