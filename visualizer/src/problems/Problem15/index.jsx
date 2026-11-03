import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '15',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/3sum/',
  complexity: 'O(n²) time: sorting costs O(n log n), then each of n anchors scans with two pointers. O(1) extra space beyond the output.',
  examples: [
    { label: 'Mixed signs', input: '[4,-2,-2,0,6,-6,1]' },
    { label: 'No triple', input: '[1,2,3,4]' },
    { label: 'All zeros', input: '[0,0,0,0]' },
  ],
}

export default function ThreeSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, i, left, right, total, triple, triples } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted values with pointers" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sorted.map((value, idx) => {
          const role = [idx === i && 'anchor', idx === left && 'left', idx === right && 'right'].filter(Boolean).join(' / ')
          const inTriple = triple && triple.includes(value) && (idx === i || idx === left || idx === right)
          return <div key={idx} data-index={idx} style={{
            minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${role ? 2 : 1}px solid ${role ? 'var(--text)' : 'var(--border)'}`,
            background: inTriple ? '#bbf7d0' : 'transparent', color: inTriple ? '#1c1917' : undefined,
          }}><div>{value}</div><small>{role}</small></div>
        })}
      </div>
      <p>{total === null ? 'No sum yet.' : `Current sum: ${total}`}</p>
      <p>Triples found: {triples.length === 0 ? 'none yet' : triples.map(t => `[${t.join(', ')}]`).join(' ')}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sort, then fix one value:</strong> with the first value fixed, the other two form a two-sum problem on a sorted range that two pointers solve in linear time.</p>
    <p><strong>Duplicates:</strong> equal neighbours are skipped at the anchor and at both pointers, so each distinct triple is reported once.</p>
  </>} />
}
