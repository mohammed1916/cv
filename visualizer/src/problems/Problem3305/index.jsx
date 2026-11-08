import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the total to zero before any start.' },
    { id: 'extend', label: 'Extend', description: 'Add the next letter to the vowel set or the consonant count.' },
    { id: 'stop', label: 'Stop', description: 'Stop a start once its consonants exceed k.' },
    { id: 'count', label: 'Count', description: 'A substring with all five vowels and exactly k consonants is counted.' },
    { id: 'done', label: 'Complete', description: 'Report the number of matching substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with word and k',
  url: 'https://leetcode.com/problems/count-of-substrings-containing-every-vowel-and-k-consonants-i/',
  complexity: 'O(n^2) time in the worst case with early stops. The visualization caps input at 14 letters.',
  examples: [
    { label: 'Seven letters, k three', input: '{"word":"aeixyou","k":3}' },
    { label: 'Five letters, k zero', input: '{"word":"zebra","k":0}' },
    { label: 'Ten letters, k four', input: '{"word":"tkqnwbhzmp","k":4}' },
    { label: 'Single letter', input: '{"word":"a","k":0}' },
    { label: 'Repeated vowels', input: '{"word":"uuuuaaaaeeeeoo","k":0}' },
    { label: 'Longest word, k = 4', input: '{"word":"aeioubcdfghjkl","k":4}' },
    { label: 'Long run: 14 letters', input: '{"word":"uurviummoauiit","k":2}' },
  ],
}

export default function VowelConsonantSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.word.length} valueAt={i => run.input.word[i]} active={step.end}
      roleAt={i => (i >= step.start && i <= step.end ? 'window' : '')} />
    <output aria-label="Counts">{`Substring ${step.start} to ${step.end}: vowels ${step.seen || 'none'}, consonants ${step.consonants} of ${run.input.k}. Total ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Once a start has more than k consonants, no longer substring from that start can have exactly k, so the inner loop stops there.</p>
  </>} />
}
