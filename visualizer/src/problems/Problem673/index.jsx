import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Singletons', description: 'Each element alone has length 1.' },
    { id: 'extend', label: 'Extend', description: 'Extend a smaller earlier value and update length and count.' },
    { id: 'done', label: 'Complete', description: 'Add the counts of every longest subsequence.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/',
  complexity: 'O(n²) time and O(n) space for this visualization; a Fenwick tree gives O(n log n).',
  examples: [
    { label: 'Two ways', input: '[1,3,5,4,7]' },
    { label: 'Ties', input: '[2,2,2,2,2]' },
    { label: 'Mixed', input: '[1,2,4,3,5,4,7,2]' },
  ],
}

export default function NumberOfLIS() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} active={step.i} valueAt={i => run.input[i]} roleAt={i => (i === step.j ? 'from' : '')} />
    <IndexedSequence label="Length ending here" length={run.input.length} active={step.i} valueAt={i => step.length[i]} />
    <IndexedSequence label="Count ending here" length={run.input.length} active={step.i} valueAt={i => step.count[i]} />
    <output aria-label="Count">{step.phase === 'done' ? `Answer: ${step.result}` : `Extending ${step.j} → ${step.i}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Ties:</strong> when another predecessor reaches the same best length, its count is added rather than replacing the old count.</p>
  </>} />
}
