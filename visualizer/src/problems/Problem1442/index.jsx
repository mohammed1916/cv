import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python, pythonLineMap } from './algorithm'

const definition = {
  number: '1442',
  inputLabel: 'Array of integers (JSON)',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  examples: [
    { label: 'Pairs', input: '[1,1]' },
    { label: 'Mixed', input: '[2,3,3,2,1]' },
    { label: 'Zeros', input: '[0,0,0,0]' },
  ],
  complexity: 'Time O(n²) with prefix XORs · Space O(n).',
  url: 'https://leetcode.com/problems/count-triplets-that-can-form-two-arrays-of-equal-xor/',
}

const cell = (active, inSegment) => ({
  display: 'inline-block', minWidth: 34, margin: 2, padding: '4px 6px', borderRadius: 6, textAlign: 'center',
  border: active ? '2px solid #0891b2' : '1px solid currentColor',
  background: inSegment ? 'rgba(8,145,178,0.2)' : 'transparent',
})

function XorVisual({ step }) {
  const { arr, pre, a, c, match, total } = step.snapshot
  return <div style={{ padding: 8 }}>
    <h4>Values</h4>
    <div>{arr.map((x, i) => <span key={i} style={cell(false, a !== null && c !== null && i >= a && i <= c)}>{x}</span>)}</div>
    <h4>Prefix XORs pre[0..n]</h4>
    <div>{pre.map((v, i) => <span key={i} style={cell(a !== null && (i === a || i === c + 1), false)}>
      <small>{i}</small><br />{v}
    </span>)}</div>
    {a !== null && c !== null && <p>Segment {a}..{c}: pre[{a}] vs pre[{c + 1}] {match ? '→ equal, middle choices ' + (c - a) : '→ differ'}</p>}
    <p>Triples counted: {total}</p>
  </div>
}

export default function EqualXorTriplets() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <XorVisual step={step} />}
    renderReasoning={() => <p>A segment XORs to zero exactly when its two prefix XORs are equal. Every split point inside that segment gives a valid triple.</p>} />
}
