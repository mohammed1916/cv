import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the lengths.' },
    { id: 'fix', label: 'Fix longest side', description: 'Pick k as the longest side and start two pointers.' },
    { id: 'hit', label: 'Triangle', description: 'The two shorter sides already exceed a[k].' },
    { id: 'miss', label: 'Too short', description: 'Advance i to get a longer shorter side.' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Side lengths nums (JSON)',
  url: 'https://leetcode.com/problems/valid-triangle-number/',
  complexity: 'O(n²) time after sorting, which costs O(n log n), and O(1) extra space.',
  examples: [
    { label: 'Mixed', input: '[2,2,3,4]' },
    { label: 'Equal', input: '[4,2,3,4]' },
    { label: 'No triangle', input: '[1,2,3]' },
  ],
}

export default function ValidTriangles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Sorted sides" length={step.sorted.length} active={step.k}
      valueAt={i => step.sorted[i]} roleAt={i => (i === step.i ? 'i' : i === step.j ? 'j' : i === step.k ? 'k' : '')} />
    <output aria-label="Triangle count">Triangles so far: {step.count}{step.i >= 0 ? ` · i=${step.i}, j=${step.j}, k=${step.k}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Triangle rule:</strong> with a ≤ b ≤ c, the triple forms a triangle exactly when a + b &gt; c. Sorting makes that test monotone in the pointers.</p>
  </>} />
}
