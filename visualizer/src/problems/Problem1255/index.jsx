import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No word has been decided yet.' },
    { id: 'take', label: 'Use word', description: 'Spend the letters for this word and recurse.' },
    { id: 'skip', label: 'Skip word', description: 'Leave this word out and recurse.' },
    { id: 'record', label: 'Record', description: 'Every word is decided, so compare the score with the best.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words, letters and a 26-value score (JSON)',
  url: 'https://leetcode.com/problems/maximum-score-words-formed-by-letters/',
  complexity: 'O(2^w * w * 26) time for w words. The visualization caps the input at 8 words.',
  examples: [
    {
      label: 'Example 1',
      input: JSON.stringify({ words: ['dog', 'cat', 'dad', 'good'], letters: ['a', 'a', 'c', 'd', 'd', 'd', 'g', 'o', 'o'], score: [1, 0, 9, 5, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }),
    },
    {
      label: 'Example 2',
      input: JSON.stringify({ words: ['xxxz', 'ax', 'bx', 'cx'], letters: ['z', 'a', 'b', 'c', 'x', 'x', 'x'], score: [4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 10] }),
    },
  ],
}

export default function WordScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.words.length} active={step.index < run.input.words.length ? step.index : -1}
      valueAt={index => run.input.words[index]}
      roleAt={index => (step.chosen.includes(index) ? 'chosen' : index < step.index ? 'skipped' : '')} />
    <output aria-label="Letters left">{`Letters left: ${step.left || '(none)'} · score ${step.total} · best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Each word is either used or skipped. Using it is allowed only when the remaining letter counts cover every letter of the word.</p>
    <p>There are few enough words that trying both choices for each word, with backtracking on the letter counts, is practical.</p>
  </>} />
}
