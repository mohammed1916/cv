import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python, pythonLineMap } from './algorithm'

const definition = {
  number: '1437',
  inputLabel: 'Object with nums (0/1 array) and k',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  examples: [
    { label: 'Spaced', input: '{"nums":[1,0,0,0,1,0,0,1],"k":2}' },
    { label: 'Too close', input: '{"nums":[1,0,1],"k":2}' },
    { label: 'Adjacent', input: '{"nums":[0,1,1,0],"k":1}' },
  ],
  complexity: 'Time O(n) · Space O(1).',
  url: 'https://leetcode.com/problems/check-if-all-1s-are-at-least-length-k-places-away/',
}

const cell = (active, one) => ({
  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: 34, margin: 2, padding: '4px 6px',
  borderRadius: 6, border: active ? '2px solid #0891b2' : '1px solid currentColor',
  background: one ? 'rgba(8,145,178,0.2)' : 'transparent',
})

function GapVisual({ step }) {
  const { nums, k, index, last, gap, verdict } = step.snapshot
  return <div style={{ padding: 8 }}>
    <h4>Positions</h4>
    <div>{nums.map((x, i) => <span key={i} style={cell(i === index, x === 1)}>
      <strong>{x}</strong><small>{i}</small>
    </span>)}</div>
    <p>Required distance k = {k}. Latest 1 at: {last ?? 'none'}{gap !== null ? ` · zeros in between: ${gap}` : ''}</p>
    {verdict !== null && <p><strong>Answer: {String(verdict)}</strong></p>}
  </div>
}

export default function AllOnesAwayByK() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <GapVisual step={step} />}
    renderReasoning={() => <p>Only neighbouring 1s matter: if each consecutive pair has at least k zeros between them, every pair is fine.</p>} />
}
