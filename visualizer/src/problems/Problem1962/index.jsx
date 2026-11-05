import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1962',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with piles and k (e.g. {"piles":[5,4,9],"k":2})',
  url: 'https://leetcode.com/problems/remove-stones-to-minimize-the-total/',
  complexity: 'O(n + k log n) time: heapify once, then one sift-down per operation.',
  examples: [
    { label: 'Two operations', input: '{"piles":[5,4,9],"k":2}' },
    { label: 'One pile', input: '{"piles":[7],"k":1}' },
  ],
}

export default function Problem1962Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <div aria-label="Max heap in array form" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {step.heap.map((v, i) => <div key={i} style={{ minWidth: 52, textAlign: 'center', padding: '6px 8px', borderRadius: 8, border: i === 0 ? '2px solid var(--primary)' : '1px solid var(--border)', background: 'var(--surface2)' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>[{i}]</div><strong>{v}</strong>
        </div>)}
      </div>
      <p>Index 0 is the largest pile (blue outline). Each operation halves it and the heap re-sorts that value down.</p>
      <output aria-label="Total stones">Total stones: {step.heap.reduce((a, b) => a + b, 0)}</output>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
