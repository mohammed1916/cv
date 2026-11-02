import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'The empty prefix has zero vowels and zero consonants.' },
    { id: 'scan', label: 'Balance', description: 'Each prefix gets a key from its vowel-minus-consonant balance and its vowel count modulo m.' },
    { id: 'done', label: 'Result', description: 'Report the number of beautiful substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters) and k (integer from 1 to 1000)',
  url: 'https://leetcode.com/problems/count-beautiful-substrings-ii/',
  complexity: 'O(n) expected time with a hash map of prefix keys. The visualization caps s at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"baeyh","k":2}' },
    { label: 'Example 2', input: '{"s":"abba","k":1}' },
  ],
}

export default function CountBeautifulSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at >= 0 ? step.at : 0}
      roleAt={i => (i === step.at ? 'window' : '')} />
    <output aria-label="Prefix balance">{`vowels ${step.v}, consonants ${step.c}, matches here ${step.found}, total ${step.answer}`}</output>
  </>} renderReasoning={() => <>
    <p>Two prefixes bound a beautiful substring when they have the same vowel-minus-consonant balance, so its vowels equal its consonants.</p>
    <p>The product of equal counts is their square, so the vowel count only needs to be a multiple of the smallest m whose square is divisible by k.</p>
  </>} />
}
