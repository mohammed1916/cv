import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Sort', description: 'Sort the values so the minimum and maximum of each subsequence are chosen positions.' },
    { id: 'gaps', label: 'Gap counts', description: 'Count the middle choices for each gap length.' },
    { id: 'prefix', label: 'Prefix sums', description: 'Accumulate the gap counts for quick range sums.' },
    { id: 'singles', label: 'Singles', description: 'Count the one-element subsequences.' },
    { id: 'pairs', label: 'Min and max', description: 'Add each value times the number of subsequences where it is the minimum or maximum.' },
    { id: 'done', label: 'Result', description: 'Reduce the total modulo 1000000007.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array JSON with nums and k',
  url: 'https://leetcode.com/problems/maximum-and-minimum-sums-of-at-most-size-k-subsequences/',
  complexity: 'O(n log n + n k) time and O(n + k) extra space for the sort and the binomial prefix sums. The visualization caps nums at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"k":2}' },
    { label: 'Example 2', input: '{"nums":[5,0,6],"k":1}' },
    { label: 'Example 3', input: '{"nums":[1,1,1],"k":2}' },
  ],
}

export default function MaximumMinimumSumsSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted values a" length={step.a.length} valueAt={index => step.a[index]}
      active={step.x} roleAt={index => (index <= step.x ? 'counted' : '')} />
    <IndexedSequence label="Prefix sums H" length={step.H.length} valueAt={index => (step.H[index] === null ? '–' : String(step.H[index]))}
      active={step.d ?? -1} roleAt={index => (step.H[index] !== null ? 'filled' : '')} />
    <p>Running total: {step.total === null ? 'not yet' : String(step.total)}</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A subsequence's minimum and maximum are its smallest and largest sorted positions, so each pair of positions contributes once for every valid choice of middle elements.</p>
  </>} />
}
