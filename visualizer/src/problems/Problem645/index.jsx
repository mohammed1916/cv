import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Counters', description: 'Create one counter per value from 1 to n.' },
    { id: 'count', label: 'Count values', description: 'Each value in the damaged array adds one to its counter.' },
    { id: 'scan', label: 'Find the gaps', description: 'A counter of 2 is the duplicate; a counter of 0 is the missing value.' },
    { id: 'done', label: 'Answer', description: 'Return [duplicate, missing].' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Damaged permutation (JSON array)',
  url: 'https://leetcode.com/problems/set-mismatch/',
  complexity: 'O(n) time and O(n) space for the counters.',
  examples: [
    { label: 'Repeat and gap', input: '[3,1,3,4]' },
    { label: 'Two items', input: '[2,2]' },
    { label: 'Early duplicate', input: '[1,1,4,3]' },
  ],
}

export default function SetMismatch() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Counter for each value" length={run.input.length} indexOffset={1}
      active={step.value === null ? -1 : step.value - 1}
      valueAt={i => step.counts[i + 1]}
      roleAt={i => (i + 1 === step.duplicate ? 'duplicate' : i + 1 === step.missing ? 'missing' : '')} />
    <output aria-label="Current findings">{step.phase === 'done' ? `Duplicate ${step.duplicate}, missing ${step.missing}` : step.value === null ? 'Counting…' : `Value ${step.value}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why counters:</strong> a value appears twice and another value never appears, so one counter per value shows both facts in one scan.</p>
  </>} />
}
