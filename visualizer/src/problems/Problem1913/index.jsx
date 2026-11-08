import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1913',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of at least four values (e.g. [2,9,4,1,7])',
  url: 'https://leetcode.com/problems/maximum-product-difference-between-two-pairs/',
  complexity: 'O(n log n) time for the sort and O(1) extra space for the two products. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Five values', input: '[2,9,4,1,7]' },
    { label: 'Repeated values', input: '[3,3,8,1]' },
    { label: 'Smallest valid input', input: '[1,2,3,4]' },
    { label: 'Equal values give zero difference', input: '[6,6,6,6,6]' },
    { label: 'Largest allowed values', input: '[10000,1,10000,1,9999]' },
    { label: 'Long run: 12 values', input: '[47,5520,9357,9030,4203,7132,5833,9714,5831,6536,7541,6478]' },
  ],
}

export default function Problem1913Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <IndexedSequence label="Sorted values" length={step.sorted.length} valueAt={i => step.sorted[i]}
        active={-1} roleAt={i => (step.roleOf ? step.roleOf(i) : '')} />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, background: 'var(--surface2)' }}>
          <strong>Largest product</strong><div>{step.big ?? '-'}</div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, background: 'var(--surface2)' }}>
          <strong>Smallest product</strong><div>{step.small ?? '-'}</div>
        </div>
        <div style={{ border: '2px solid var(--primary)', borderRadius: 8, padding: 10 }}>
          <strong>Difference</strong><div>{step.result ?? '-'}</div>
        </div>
      </div>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
