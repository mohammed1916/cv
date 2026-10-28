import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the length of the string.' },
    { id: 'length', label: 'Choose length', description: 'Try a length that divides the string length.' },
    { id: 'block', label: 'Compare block', description: 'Compare one block with the first block by its letters.' },
    { id: 'found', label: 'Found', description: 'Every block is an anagram of the first, so this length works.' },
    { id: 'done', label: 'Complete', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string as a JSON string',
  url: 'https://leetcode.com/problems/minimum-length-of-anagram-concatenation/',
  complexity: 'O(n * d * log k) time for d divisors of n, with sorting per block. The visualization caps input at 16 characters.',
  examples: [
    { label: 'Example 1', input: '"abba"' },
    { label: 'Example 2', input: '"cdef"' },
  ],
}

export default function MinimumAnagramConcatenation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.length} valueAt={i => run.input[i]} active={step.from >= 0 ? step.from : -1} roleAt={i => (step.from >= 0 && i >= step.from && i < step.to ? (step.ok === false ? 'mismatch' : 'block') : '')} />
    <output aria-label="Candidate length">{step.k === null ? 'No length chosen yet' : `Candidate length: ${step.k}`}</output>
  </>} renderReasoning={() => <>
    <p>The answer must divide the string length, so only divisors need checking, from shortest to longest.</p>
    <p>A length works when every block has the same letters as the first block, because anagrams share letter counts.</p>
  </>} />
}
