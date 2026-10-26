import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty counts', description: 'Count each value from 1 to n.' },
    { id: 'count', label: 'Count value', description: 'Increment the bucket for the value read.' },
    { id: 'done', label: 'Complete', description: 'Report the duplicate and the missing value.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON, a damaged permutation)',
  url: 'https://leetcode.com/problems/set-mismatch/',
  complexity: 'O(n) time and O(n) space for the count buckets.',
  examples: [
    { label: 'Duplicate 2, missing 3', input: '[1,2,2,4]' },
    { label: 'Duplicate 1, missing 2', input: '[1,1]' },
    { label: 'Duplicate 3, missing 1', input: '[3,2,3,4,6,5]' },
  ],
}

export default function SetMismatch() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Counts for values 1..n (index is the value)" length={run.input.length + 1} active={step.value ?? -1}
      valueAt={i => (i === 0 ? '–' : step.counts[i])} roleAt={i => (i === 0 ? '' : step.counts[i] === 0 && step.phase === 'done' ? 'missing' : step.counts[i] === 2 ? 'duplicate' : '')} />
    <output aria-label="Result">{step.phase === 'done' ? `[${step.duplicate}, ${step.missing}]` : `Counting… duplicate so far: ${step.duplicate ?? 'none'}`}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Why counts work:</strong> a value present twice has count 2, and the one missing has count 0. The n + 1 buckets keep the value 1 and index 0 unambiguous.</p>
    <p>{run.input.length} numbers were checked.</p>
  </>} />
}
