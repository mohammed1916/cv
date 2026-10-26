import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Counts', description: 'Track first and last positions.' },
    { id: 'candidate', label: 'Candidate value', description: 'A value with the top frequency defines a span.' },
    { id: 'done', label: 'Complete', description: 'Return the shortest span.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/degree-of-an-array/',
  complexity: 'O(n) time and O(d) space for the d distinct values.',
  examples: [
    { label: 'Degree two', input: '[1,2,2,3,1]' },
    { label: 'Span four', input: '[1,2,2,3,1,4,2]' },
    { label: 'Single', input: '[5]' },
  ],
}

export default function DegreeOfArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} active={step.index}
      valueAt={i => run.input[i]} roleAt={i => (step.span && i >= step.span[0] && i <= step.span[1] ? 'in-window' : '')} />
    <output aria-label="Degree and span">Degree {step.degree ?? '—'}{step.value !== undefined ? ` · ${step.value} spans ${step.span[1] - step.span[0] + 1}` : ''} · best {step.best ?? '—'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why first and last:</strong> the shortest subarray with degree d must start and end at occurrences of a value that appears d times.</p>
  </>} />
}
