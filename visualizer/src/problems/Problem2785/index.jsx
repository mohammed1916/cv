import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'collect', label: 'Find vowels', description: 'Mark the positions that hold vowels; consonants are never moved.' },
    { id: 'sort', label: 'Sort vowels', description: 'Sort the collected vowels by character code, so uppercase comes first.' },
    { id: 'write', label: 'Write back', description: 'Place the sorted vowels into the vowel positions in order.' },
    { id: 'done', label: 'Complete', description: 'Report the rebuilt string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (English letters)',
  url: 'https://leetcode.com/problems/sort-vowels-in-a-string/',
  complexity: 'O(n log n) time for sorting the vowels, O(n) space for the output.',
  examples: [
    { label: 'Example 1', input: '{"s":"lEetcOde"}' },
    { label: 'Example 2', input: '{"s":"lYmpH"}' },
  ],
}

export default function SortVowels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Current string">{`Current string: ${step.text}`}</output>
    <output aria-label="Sorted vowels">{step.sorted !== undefined && step.sorted !== null ? `Sorted vowels: ${step.sorted || 'none'}` : 'Sorted vowels: not yet'}</output>
    <output aria-label="Position being written">{step.at === null ? 'No position being written' : `Writing position ${step.at}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the vowel positions change, so consonants and their places in the string stay fixed.</p>
    <p>Sorting by character code puts every uppercase vowel before every lowercase vowel, which matches the required order.</p>
  </>} />
}
