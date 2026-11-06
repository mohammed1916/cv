import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1502',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr (JSON)',
  url: 'https://leetcode.com/problems/can-make-arithmetic-progression-from-sequence/',
  complexity: 'O(n log n) time for the sort and O(n) for the gap check, with O(n) space for the sorted copy.',
  examples: [
    { label: 'Shuffled', input: '{"arr":[7,1,5,9,3]}' },
    { label: 'Uneven gap', input: '{"arr":[4,1,9,2]}' },
    { label: 'Negatives', input: '{"arr":[-6,0,-3,3]}' },
  ],
}

const MATCH = 'color-mix(in srgb, var(--success) 35%, var(--surface2))'
const MISMATCH = 'color-mix(in srgb, var(--primary) 45%, var(--surface2))'

export default function ArithmeticFromSequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, pos, step: requiredGap, gap, ok } = step.snapshot
    return <>
      <section aria-label="Sorted values and gaps">
        <h3>Sorted values and the gap between neighbours</h3>
        <div role="img" aria-label="Sorted values and gaps" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {sorted.map((value, i) => {
            const isCompared = pos !== null && i === pos
            const gapHere = i > 0 ? value - sorted[i - 1] : null
            const gapTone = !isCompared || gapHere === null ? 'transparent' : ok ? MATCH : MISMATCH
            return <div key={i} style={{ textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)' }}>
              <small style={{ display: 'block', height: 16, color: 'var(--text-muted)' }}>{gapHere === null ? '' : `gap ${gapHere}`}</small>
              <div style={{
                minWidth: 52, padding: '6px 8px', boxSizing: 'border-box',
                border: `${isCompared ? 2 : 1}px solid ${isCompared ? 'var(--text)' : 'var(--border)'}`,
                background: gapTone,
              }}>{value}</div>
            </div>
          })}
        </div>
      </section>
      <p>{requiredGap === null || requiredGap === undefined ? 'The required gap is not known yet.' : `Required gap, from the first two sorted values: ${requiredGap}.`}</p>
      <p>{gap === null || gap === undefined ? 'No neighbouring pair is compared yet.' : `Comparing a gap of ${gap} with the required gap of ${requiredGap}: ${ok ? 'they match.' : 'they differ.'}`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sort first:</strong> in a progression the sorted order is the only order where neighbours differ by the same step, so sorting loses nothing.</p>
    <p><strong>One check:</strong> compare each neighbouring gap with the first gap; any mismatch rules the sequence out.</p>
  </>} />
}
