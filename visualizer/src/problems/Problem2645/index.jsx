import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Expect a', description: 'Start expecting the letter a.' },
    { id: 'insert', label: 'Insert', description: 'Add a missing letter so the next block letter lines up.' },
    { id: 'match', label: 'Match', description: 'Use a word letter that matches the expected one.' },
    { id: 'tail', label: 'Tail', description: 'Finish a partial block with its missing letters.' },
    { id: 'done', label: 'Complete', description: 'Report the number of inserted letters.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with word, made of the letters a, b and c',
  url: 'https://leetcode.com/problems/minimum-additions-to-make-valid-string/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the word at 40 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"aabcbc"}' },
    { label: 'Example 2', input: '{"word":"abcabcababcc"}' },
  ],
}

export default function MinimumAdditionsValidString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Word" length={run.word.length} valueAt={index => run.word[index]} active={step.index} roleAt={index => (step.index >= 0 && index < step.index ? 'done' : '')} />
    <output aria-label="Insertions">{`Expecting ${'abc'[step.need]}, insertions so far: ${step.added}`}</output>
  </>} renderReasoning={() => <>
    <p>A valid string is a repeat of abc, so the scan keeps a pointer to the letter the next block needs.</p>
    <p>When a word letter is not the one expected, the missing letters must be inserted first, and each costs one insertion.</p>
  </>} />
}
