import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Count the vowels in the first word; that count is the target.' },
    { id: 'reverse', label: 'Reverse', description: 'This word has the target vowel count, so reverse it.' },
    { id: 'keep', label: 'Keep', description: 'This word has a different vowel count, so keep it.' },
    { id: 'done', label: 'Complete', description: 'Join the words with single spaces.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words (JSON object with s)',
  url: 'https://leetcode.com/problems/reverse-words-with-same-vowel-count/',
  complexity: 'O(n) time and O(n) space, where n is the length of s. The visualization caps input at 80 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"cat and mice"}' },
    { label: 'Second word', input: '{"s":"book is nice"}' },
  ],
}

export default function ReverseWordsWithSameVowelCount() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Words" length={step.words.length} valueAt={i => step.words[i]} active={step.index}
      roleAt={i => (i === 0 ? 'target' : i < step.index ? 'read' : '')} />
    <output aria-label="Target vowel count">{`Target vowel count: ${step.target}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only words after the first are changed. A word is reversed exactly when its vowel count matches the first word.</p>
  </>} />
}
