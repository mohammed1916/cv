import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Set the range of lengths to search.' },
    { id: 'search', label: 'Try length', description: 'Hash every window of the middle length and look for equal hashes.' },
    { id: 'done', label: 'Complete', description: 'Report the longest repeated substring.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'A JSON string of lowercase letters, for example "banana"',
  url: 'https://leetcode.com/problems/longest-duplicate-substring/',
  complexity: 'O(n log n) expected time with a rolling hash and a binary search on length. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Banana', input: '"banana"' },
    { label: 'Repeats', input: '"abab"' },
  ],
}

export default function LongestDuplicateSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Text" length={run.input.length} valueAt={index => run.input[index]} />
    <output aria-label="Search range">{`Lengths ${step.lo} to ${step.hi}${step.mid ? `, trying ${step.mid}` : ''}`}</output>
    <output aria-label="Best so far">{`Best so far: ${step.best || '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>If a repeat exists at some length, one exists at every shorter length, so the length can be found by binary search.</p>
    <p>A rolling hash gives each window a number in constant time. Equal numbers are only candidates, so the letters are compared before a repeat is accepted.</p>
  </>} />
}
