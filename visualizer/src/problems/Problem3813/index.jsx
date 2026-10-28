import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin both counts at zero.' },
    { id: 'scan', label: 'Scan', description: 'Count the current character as a vowel, a consonant, or neither.' },
    { id: 'done', label: 'Complete', description: 'Report the score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s: 1 to 30 lowercase letters and spaces',
  url: 'https://leetcode.com/problems/vowel-consonant-score/',
  complexity: 'O(n) time for a string of length n. The visualization caps s at 30 characters.',
  examples: [
    { label: 'Education', input: '{"s":"education"}' },
    { label: 'Vowels only', input: '{"s":"aeiou"}' },
  ],
}

export default function VowelConsonantScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters of s" length={run.input.s.length} valueAt={index => (run.input.s[index] === ' ' ? '␠' : run.input.s[index])} active={step.index} />
    <output aria-label="Counts">{`Vowels ${step.vowels}; consonants ${step.consonants}; score ${step.score}`}</output>
  </>} renderReasoning={() => <>
    <p>Only letters count: vowels are a, e, i, o and u, and every other letter is a consonant.</p>
    <p>The score is the vowel count divided by the consonant count, rounded down, and it is 0 when there are no consonants.</p>
  </>} />
}
