import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty set of echoes.' },
    { id: 'length', label: 'Half-length', description: 'Check every start for a block that repeats right after itself.' },
    { id: 'done', label: 'Complete', description: 'Report the number of distinct echoes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'A JSON string of lowercase letters, for example "abcabcabc"',
  url: 'https://leetcode.com/problems/distinct-echo-substrings/',
  complexity: 'O(n^3) time in this direct form, with O(1) hash comparisons. The visualization caps input at 20 letters.',
  examples: [
    { label: 'Example 1', input: '"abcabcabc"' },
    { label: 'Repeated letter', input: '"aaaa"' },
  ],
}

export default function DistinctEchoSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Text" length={run.input.length} valueAt={index => run.input[index]} />
    <output aria-label="Echo count">{`Half-length ${step.len} · distinct echoes: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>An echo is a block a followed immediately by a copy of itself, so every candidate has an even length and a start position.</p>
    <p>For each half-length, a rolling hash checks the two halves quickly, and a set keeps each distinct echo once.</p>
  </>} />
}
