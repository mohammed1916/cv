import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Prepare the left and right sums.' },
    { id: 'left', label: 'Left', description: 'Cap the towers between the last shorter tower and this peak.' },
    { id: 'right', label: 'Right', description: 'Cap the towers between this peak and the next shorter tower.' },
    { id: 'best', label: 'Peak', description: 'Total the mountain built around each peak.' },
    { id: 'done', label: 'Result', description: 'Report the tallest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"maxHeights": [5, 3, 4, 1, 1]}',
  url: 'https://leetcode.com/problems/beautiful-towers-i/',
  complexity: 'O(n) time and O(n) space with monotonic stacks. The visualization caps the array at 12 towers.',
  examples: [
    { label: 'Peak in the middle', input: '{"maxHeights":[4,2,6,3,1]}' },
    { label: 'Two equal tops', input: '{"maxHeights":[7,2,5,5]}' },
  ],
}

// Towers as bars: the chosen mountain for the current peak is drawn with capped heights; l and r bound the capped run.
function Towers({ run, step }) {
  const h = run.input.maxHeights
  const peak = step.peak
  const capped = h.map((_, k) => {
    if (peak < 0) return null
    if (k === peak) return h[peak]
    const [a, b] = k < peak ? [k, peak] : [peak, k]
    let m = Infinity
    for (let j = a; j <= b; j++) m = Math.min(m, h[j])
    return m
  })
  const max = Math.max(...h)
  return <figure aria-label="Tower heights" style={{ margin: '0 0 12px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 150, padding: '0 4px', borderBottom: '1px solid var(--text)' }}>
      {h.map((v, k) => {
        const role = k === step.l ? 'l' : k === step.r ? 'r' : k === peak ? 'peak' : ''
        const shown = capped[k] ?? v
        return <div key={k} style={{ flex: 1, textAlign: 'center', color: 'var(--text)' }}>
          <div style={{ height: `${(shown / max) * 120}px`, background: capped[k] !== null && capped[k] < v ? 'var(--surface2)' : 'var(--primary)', border: k === peak ? '2px solid var(--text)' : 'none', borderRadius: '4px 4px 0 0' }} />
          <small>{`[${k}] ${v}${capped[k] !== null && capped[k] !== v ? ` → ${capped[k]}` : ''}`}</small>
          <div><strong>{role}</strong></div>
        </div>
      })}
    </div>
    <figcaption style={{ color: 'var(--text)' }}>{peak < 0 ? 'Bars show maxHeights.' : `Peak ${peak}: shaded bars are capped down to match it. Left sum ${step.left[peak]}, right sum ${step.right[peak]}.`}</figcaption>
  </figure>
}

export default function BeautifulTowersI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Towers run={run} step={step} />
    <output aria-label="Best total">{step.best === null ? 'No peak totalled yet' : `Best total so far: ${step.best}`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A mountain has one peak. Going left from the peak, each tower may be lowered but never raised, so the stack of smaller towers gives the cheapest cap for each side.</p>
    <p>For each peak, the left sum and the right sum are computed once from the previous smaller tower, and the best total is kept.</p>
  </>} />
}
