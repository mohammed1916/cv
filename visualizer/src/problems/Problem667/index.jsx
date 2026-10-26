import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ends', description: 'Start at the low and high ends of the zig-zag range.' },
    { id: 'place', label: 'Zig-zag', description: 'Alternate low and high values.' },
    { id: 'tail', label: 'Consecutive tail', description: 'Finish in order; differences of 1 are already counted.' },
    { id: 'done', label: 'Complete', description: 'Return the permutation.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Parameters (JSON object with n and k)',
  url: 'https://leetcode.com/problems/beautiful-arrangement-ii/',
  complexity: 'O(n) time and O(n) space for the output.',
  examples: [
    { label: 'Three distinct', input: '{"n":3,"k":1}' },
    { label: 'Two distinct', input: '{"n":3,"k":2}' },
    { label: 'Longer', input: '{"n":6,"k":3}' },
  ],
}

export default function BeautifulArrangement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Permutation" length={step.perm.length || 1} active={step.perm.length - 1} valueAt={i => (step.perm[i] ?? '…')} />
    <output aria-label="Distinct differences">Distinct differences: {step.diffs.length ? step.diffs.join(', ') : '—'}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Construction:</strong> the zig-zag uses differences k, k−1, …, 1 exactly once each, and the consecutive tail adds only difference 1.</p>
    <p>Target: {run.input.n} numbers with exactly {run.input.k} distinct differences.</p>
  </>} />
}
