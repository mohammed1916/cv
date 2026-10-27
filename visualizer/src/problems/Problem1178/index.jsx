import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Letter sets', description: 'Group the words by the set of letters they use.' },
    { id: 'puzzle', label: 'Puzzle', description: 'Start counting for the next puzzle.' },
    { id: 'subset', label: 'Subset', description: 'Try one letter set that holds the first letter and some of the other letters.' },
    { id: 'done', label: 'Complete', description: 'Report one count per puzzle.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words and puzzles (JSON object with words and puzzles arrays)',
  url: 'https://leetcode.com/problems/number-of-valid-words-for-each-puzzle/',
  complexity: 'O(words + puzzles * 2^6) time with one bitmask per word. The visualization caps the input at 12 words and 6 puzzles.',
  examples: [
    { label: 'Official', input: '{"words":["aaaa","asas","able","ability","actt","actor","access"],"puzzles":["aboveyz","abrodyz","abslute","absoryz","actresz","gaswxyz"]}' },
    { label: 'Missing first letter', input: '{"words":["bcd","abc"],"puzzles":["abcdefg"]}' },
  ],
}

export default function ValidWordsForPuzzles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Puzzles" length={run.puzzles.length} active={step.puzzle}
      valueAt={index => run.puzzles[index]}
      roleAt={index => (index < step.answer.length ? `count ${step.answer[index]}` : '')} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A word is valid for a puzzle when it contains the puzzle's first letter and uses only letters from the puzzle.</p>
    <p>The other six letters of a puzzle give 64 subsets. Adding the first letter to each subset gives every letter set a valid word can have, so one lookup per subset counts them all.</p>
  </>} />
}
