import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
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
    { label: 'No repeat', input: '"abcd"' },
  ],
}

export default function LongestDuplicateSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.length
    const max = Math.max(1, n - 1)
    return <>
      <IndexedSequence label="Text" length={n} valueAt={index => run.input[index]} />
      <AnswerRangeBar title="Length search" min={1} max={max} low={Math.max(1, step.lo)} high={Math.max(1, step.hi)}
        probe={step.mid} verdict={step.mid === null ? null : step.found} />
      <output aria-label="Search range">{`Lengths ${step.lo} to ${step.hi}${step.mid ? `, trying ${step.mid}` : ''}`}</output>
      <output aria-label="Best so far">{`Best so far: ${step.best || '(none)'}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>If a repeat exists at some length, one exists at every shorter length, so the length can be found by binary search. The bar shows the range still possible; the marker is the length being tried.</p>
    <p>A rolling hash gives each window a number in constant time. Equal numbers are only candidates, so the letters are compared before a repeat is accepted.</p>
  </>} />
}
