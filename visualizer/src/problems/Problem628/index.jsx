import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No values seen yet.' },
    { id: 'scan', label: 'Scan', description: 'Update the top three and bottom two.' },
    { id: 'done', label: 'Complete', description: 'Compare the two candidate products.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/maximum-product-of-three-numbers/',
  complexity: 'O(n) time and O(1) extra space; sorting would also work in O(n log n).',
  examples: [
    { label: 'Positive', input: '[1,2,3]' },
    { label: 'Two negatives', input: '[1,2,3,4]' },
    { label: 'All negative', input: '[-1,-2,-3,-4]' },
  ],
}

export default function MaxProductThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input" length={run.input.length} active={run.input.indexOf(step.value)} valueAt={i => run.input[i]} />
    <div className="algorithm-sequence"><h3>Tracked values</h3>
      <p>Top three: {step.top.map(v => (Number.isFinite(v) ? v : '—')).join(', ')}</p>
      <p>Two smallest: {step.low.map(v => (Number.isFinite(v) ? v : '—')).join(', ')}</p>
    </div>
    <output aria-label="Best product">{step.result !== undefined ? `Best product: ${step.result}` : 'Scanning…'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Two candidates:</strong> either the three largest multiply directly, or two negatives (the smallest pair) multiply to a positive that the largest value scales.</p>
  </>} />
}
