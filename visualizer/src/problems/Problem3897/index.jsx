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
    { label: 'Example', input: '{"nums1":[1,2],"nums0":[1,0]}' },
    { label: 'Three segments', input: '{"nums1":[0,3,1],"nums0":[2,0,1]}' },
  ],
}

export default function MaximumValueOfConcatenatedBinarySegments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Segments in the chosen order">
      <h3>Segments placed so far</h3>
      <div className="algorithm-sequence__cells">{step.order.length === 0 ? <p>None placed yet.</p> : step.order.map((seg, i) => (
        <div key={i} className={`algorithm-sequence__cell ${step.current === seg ? 'is-active' : ''}`} data-role={step.current === seg ? 'current' : ''}>
          <small>seg {seg.index}</small><strong>{'1'.repeat(seg.ones) + '0'.repeat(seg.zeros) || '-'}</strong><span>{seg.len} bits</span>
        </div>))}</div>
    </section>
    <output aria-label="Concatenated value">{`Value so far ${step.total.toString(2) || '0'} (binary). ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Placing a segment shifts everything before it left by the segment length, so a segment with a high value per bit is best placed earlier.</p>
    <p>Two adjacent segments are ordered by comparing their values scaled by each other's lengths, which gives a fixed sort order.</p>
  </>} />
}
