import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'No change', description: 'Count the partitions of the string as given.' },
    { id: 'try', label: 'Try a change', description: 'Replace one letter and count the partitions of the new string.' },
    { id: 'done', label: 'Complete', description: 'Report the most partitions over all candidates.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters) and k (JSON)',
  url: 'https://leetcode.com/problems/maximize-the-number-of-partitions-after-operations/',
  complexity: 'O(26 * n^2) time in this trace, which tries every single change and rescans; the Python version does the same. The visualization caps s at 8 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"accca","k":2}' },
    { label: 'Example 2', input: '{"s":"xxyz","k":1}' },
    { label: "Single letter", input: '{"s":"a","k":1}' },
    { label: "Largest k", input: '{"s":"zyxwvuts","k":26}' },
    { label: "Repeated letters", input: '{"s":"abab","k":2}' },
    { label: "Long run: 8 letters", input: '{"s":"vdbbvfqe","k":5}' },
  ],
}

export default function MaximizePartitionsAfterOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String with the candidate change" length={step.candidate.length} valueAt={i => step.candidate[i]}
      active={step.position} roleAt={i => (i === step.position ? 'changed' : '')} />
    <output aria-label="Partitions">{step.phase === 'done' ? `Answer: ${run.result}` : `Candidate gives ${step.count}; best ${step.best}, with k = ${run.input.k}`}</output>
  </>} renderReasoning={() => <>
    <p>The operations cut the string greedily: each partition is the longest prefix with at most k distinct letters.</p>
    <p>Only one letter may change, and it changes before any partition is cut, so every single change is tried and the best count kept.</p>
  </>} />
}
