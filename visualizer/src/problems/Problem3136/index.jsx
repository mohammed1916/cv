import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Length', description: 'Check that the word has at least three characters.' },
    { id: 'scan', label: 'Scan', description: 'Check each character and note whether a vowel or consonant has appeared.' },
    { id: 'reject', label: 'Reject', description: 'A rule is broken, so the word is not valid.' },
    { id: 'done', label: 'Complete', description: 'Report whether the word is valid.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with word: 1 to 20 characters from letters, digits, @, # and $',
  url: 'https://leetcode.com/problems/valid-word/',
  complexity: 'O(n) time for a word of length n. The visualization caps words at 20 characters.',
  examples: [
    { label: 'Valid', input: '{"word":"234Adas"}' },
    { label: 'Missing vowel', input: '{"word":"b3"}' },
    { label: 'Symbol', input: '{"word":"a3$e"}' },
  ],
}

export default function ValidWord() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.word.length} valueAt={index => run.input.word[index]} active={step.index} />
    <output aria-label="Flags">{`Vowel seen: ${step.hasVowel ? 'yes' : 'no'}; consonant seen: ${step.hasConsonant ? 'yes' : 'no'}`}</output>
  </>} renderReasoning={() => <>
    <p>The word is rejected at the first character that is not a letter or digit, since no later check can repair it.</p>
    <p>A vowel and a consonant can each appear anywhere, so both flags are tracked during one scan.</p>
  </>} />
}
