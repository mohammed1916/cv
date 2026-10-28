import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin counting the letters of s.' },
    { id: 'vowel', label: 'Vowel', description: 'Update the best vowel count.' },
    { id: 'consonant', label: 'Consonant', description: 'Update the best consonant count.' },
    { id: 'done', label: 'Complete', description: 'Add the two best counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String of lowercase letters (JSON string, up to 30 letters)',
  url: 'https://leetcode.com/problems/find-most-frequent-vowel-and-consonant/',
  complexity: 'O(n + 26) time and O(1) extra space. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Example 1', input: '"successes"' },
    { label: 'Vowels only', input: '"aeiou"' },
  ],
}

export default function MostFrequentVowelConsonant() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.length} valueAt={i => run.input[i]} active={-1}
      roleAt={i => (step.letter === run.input[i] ? 'current' : '')} />
    <p aria-label="Best counts">{`Best vowel: ${step.bestVowel}; best consonant: ${step.bestConsonant}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The answer is the largest count among vowels plus the largest count among consonants. A class with no letters contributes zero.</p>
  </>} />
}
