import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'segments', label: 'Segments', description: 'Build each run of ones and zeros.' },
    { id: 'place', label: 'Place', description: 'Append segments in the chosen order.' },
    { id: 'done', label: 'Result', description: 'Report the value modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 (ones per segment) and nums0 (zeros per segment)',
  url: 'https://leetcode.com/problems/maximum-value-of-concatenated-binary-segments/',
  complexity: 'O(n log n) comparisons with big-integer arithmetic. The visual caps each count at 8 and n at 8.',
  examples: [
    { label: 'Example', input: '{"nums1":[2,0,1],"nums0":[1,3,0]}' },
    { label: 'Three segments', input: '{"nums1":[0,3,1],"nums0":[2,0,1]}' },
    { label: 'Single segment of ones', input: '{"nums1":[1],"nums0":[0]}' },
    { label: 'Single segment of zeros', input: '{"nums1":[0],"nums0":[1]}' },
    { label: 'Equal segments', input: '{"nums1":[2,2],"nums0":[2,2]}' },
    { label: 'Maximum counts', input: '{"nums1":[8,0,8],"nums0":[0,8,8]}' },
    { label: 'Long run: 8 segments', input: '{"nums1":[0,2,6,0,8,8,1,6],"nums0":[2,1,3,4,0,5,7,4]}' },
  ],
}

// Every segment with its bits and its place in the final order. The placed row is the one just appended.
function SegmentTable({ segments, order, placed, current }) {
  const rank = new Map(order.map((seg, i) => [seg.index, i + 1]))
  const done = new Set(placed)
  return <table aria-label="Segments and their place in the order">
    <thead><tr><th scope="col">segment</th><th scope="col">bits</th><th scope="col">value</th><th scope="col">place</th></tr></thead>
    <tbody>{segments.map(seg => <tr key={seg.index} data-current={current && current.index === seg.index ? 'yes' : undefined}>
      <th scope="row">{seg.index}</th>
      <td><code>{'1'.repeat(seg.ones) + '0'.repeat(seg.zeros) || '-'}</code></td>
      <td>{seg.val.toString(2) || '0'}</td>
      <td>{done.has(seg.index) ? rank.get(seg.index) : '–'}</td>
    </tr>)}</tbody>
  </table>
}

export default function MaximumValueOfConcatenatedBinarySegments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { frames } = buildTrace(run.input)
    const finalOrder = frames.at(-1).order
    const segments = run.input.nums1.map((o, i) => ({ index: i, ones: o, zeros: run.input.nums0[i], len: o + run.input.nums0[i], val: ((1n << BigInt(o)) - 1n) << BigInt(run.input.nums0[i]) }))
    return <>
      <SegmentTable segments={segments} order={finalOrder} placed={step.order.map(seg => seg.index)} current={step.current} />
      <section className="algorithm-sequence" aria-label="Segments in the chosen order">
        <h3>Segments placed so far (left is earlier)</h3>
        <div className="algorithm-sequence__cells">{step.order.length === 0 ? <p>None placed yet.</p> : step.order.map((seg, i) => (
          <div key={i} className={`algorithm-sequence__cell ${step.current === seg ? 'is-active' : ''}`} data-role={step.current === seg ? 'current' : ''}>
            <small>seg {seg.index}</small><strong>{'1'.repeat(seg.ones) + '0'.repeat(seg.zeros) || '-'}</strong><span>{seg.len} bits</span>
          </div>))}</div>
      </section>
      <output aria-label="Concatenated value">{`Value so far ${step.total.toString(2) || '0'} (binary). ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Placing a segment shifts everything before it left by the segment length, so a segment with a high value per bit is best placed earlier.</p>
    <p>Two adjacent segments are ordered by comparing their values scaled by each other's lengths, which gives a fixed sort order.</p>
  </>} />
}
