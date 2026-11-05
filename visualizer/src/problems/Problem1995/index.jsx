import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1995',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer array of length 4 to 30 (JSON)',
  url: 'https://leetcode.com/problems/count-special-quadruplets/',
  complexity: 'O(n^4) in this direct form (n is capped at 30 here); a pair-sum table would reduce it.',
  examples: [
    { label: 'Two matches', input: '[2,2,4,8,6]' },
    { label: 'None', input: '[5,1,2,9]' },
    { label: 'Repeats', input: '[1,2,3,3,6,6]' },
  ],
}

export default function CountSpecialQuadruplets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, d, quad, count, found } = step.snapshot
    const inQuad = i => (quad ? quad.includes(i) : false)
    return <>
      <div aria-label="Values by index" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((v, i) => <span key={i} style={{
          border: `${i === d ? 2 : 1}px solid ${i === d ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', color: 'var(--text)',
          background: inQuad(i) ? 'var(--primary-glow)' : 'transparent',
        }}>[{i}] {v}</span>)}
      </div>
      <p>Current target index <strong>d = {d >= 0 ? d : '-'}</strong>. Quadruplets counted: <strong>{count}</strong>.</p>
      {found.length > 0 && <p>Latest: ({found[found.length - 1].join(', ')}).</p>}
    </>
  }} renderReasoning={() => <p>Each quadruplet is one index tuple, so the three earlier indices must be distinct and ordered. Every choice of d and an earlier triple is compared once.</p>} />
}
