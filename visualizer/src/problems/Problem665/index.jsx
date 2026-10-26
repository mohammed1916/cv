import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Walk left to right looking for descents.' },
    { id: 'lower', label: 'Lower left', description: 'Set a[i−1] to a[i] when a[i−2] allows it.' },
    { id: 'raise', label: 'Raise right', description: 'Set a[i] to a[i−1] otherwise.' },
    { id: 'reject', label: 'Second descent', description: 'Two changes are needed, so the answer is false.' },
    { id: 'done', label: 'Complete', description: 'Report whether at most one change was used.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/non-decreasing-array/',
  complexity: 'O(n) time and O(1) extra space; the visualization keeps a copy of the array per frame for display.',
  examples: [
    { label: 'Lower left', input: '[4,2,3]' },
    { label: 'Raise right', input: '[4,2,1]' },
    { label: 'Two descents', input: '[3,4,2,3]' },
  ],
}

export default function NonDecreasing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Array after changes" length={step.values.length} active={step.index}
      valueAt={i => step.values[i]} roleAt={i => (i === step.index ? (step.phase === 'raise' ? 'raised' : step.phase === 'lower' ? 'lowered' : 'current') : '')} />
    <output aria-label="Changes used">Changes used: {step.changes}{step.phase === 'done' ? ` · result ${String(step.result)}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Choosing which side:</strong> if a[i−2] ≤ a[i], lowering a[i−1] keeps the prefix sorted; otherwise a[i−1] is too large for everything before it, so a[i] must be raised.</p>
  </>} />
}
