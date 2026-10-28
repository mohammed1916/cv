import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Keep the first word.' },
    { id: 'keep', label: 'Keep', description: 'This word is not an anagram of the last kept word.' },
    { id: 'skip', label: 'Remove', description: 'This word is an anagram of the last kept word, so it is removed.' },
    { id: 'done', label: 'Complete', description: 'Return the kept words in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words (JSON object with words)',
  url: 'https://leetcode.com/problems/find-resultant-array-after-removing-anagrams/',
  complexity: 'O(n * m log m) time for sorting letters of each word. The visualization caps input at 20 words.',
  examples: [
    { label: 'Example 1', input: '{"words":["abba","baba","bbaa","cd","cd"]}' },
    { label: 'No anagrams', input: '{"words":["a","b","c","d","e"]}' },
  ],
}

export default function RemoveAnagrams() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.words.length} valueAt={i => run.input.words[i]} active={step.index}
      roleAt={i => (step.index >= 0 && i < step.index && step.kept.includes(run.input.words[i]) ? 'kept' : '')} />
    <output aria-label="Kept words">{`Kept: ${step.kept.join(', ')}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Anagrams form one class, so comparing each word with the last kept word finds every adjacent anagram.</p>
  </>} />
}
