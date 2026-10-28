import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how often each letter appears.' },
    { id: 'rank', label: 'Rank', description: 'Assign each letter a press count by its rank, eight letters per tier.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of pushes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a lowercase string word',
  url: 'https://leetcode.com/problems/minimum-number-of-pushes-to-type-word-i/',
  complexity: 'O(d log d) time for d distinct letters. The visualization caps the word at 40 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"abcde"}' },
    { label: 'Example 2', input: '{"word":"xyzxyzx"}' },
  ],
}

export default function MinimumPushesTypeWord() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters by frequency" length={run.ranked.length} valueAt={index => run.ranked[index]} active={step.index} />
    <output aria-label="Pushes">{`Pushes so far: ${step.pushes}`}</output>
  </>} renderReasoning={() => <>
    <p>Keys 2 to 9 each hold up to eight letters, and the press count of a letter is its position on its key.</p>
    <p>Frequent letters should be pressed least, so the letters are ranked by frequency and each block of eight letters costs one more press than the block before.</p>
  </>} />
}
