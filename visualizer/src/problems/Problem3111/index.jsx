import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'List the distinct x values in order.' },
    { id: 'place', label: 'Place', description: 'An uncovered x starts a rectangle that reaches x + w.' },
    { id: 'cover', label: 'Covered', description: 'This x already lies inside the current rectangle.' },
    { id: 'done', label: 'Result', description: 'Every x is covered by the rectangles counted so far.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points ([x, y] pairs) and w',
  url: 'https://leetcode.com/problems/minimum-rectangles-to-cover-points/description/',
  complexity: 'O(n log n) time for the sort, O(n) extra space for the distinct x values.',
  examples: [
    { label: 'Invented cluster', input: '{"points":[[3,2],[7,0],[7,5],[11,9],[12,4],[20,6]],"w":4}' },
    { label: 'Wide reach', input: '{"points":[[1,3],[2,2],[5,9],[6,1],[9,4]],"w":2}' },
  ],
}

export default function MinimumRectanglesToCoverPoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const xs = run.xs
    const lo = xs.length ? Math.min(...xs) : 0
    const hi = xs.length ? Math.max(...xs) : 1
    const span = Math.max(1, hi - lo)
    const pct = v => `${((v - lo) / span) * 100}%`
    return <>
      <div aria-label="Number line of x values" style={{ position: 'relative', height: 64, margin: '12px 0' }}>
        <div style={{ position: 'absolute', top: 30, left: 0, right: 0, height: 2, background: 'currentColor', opacity: 0.4 }} />
        {step.start !== null && step.start !== undefined && <div aria-label="Current rectangle" style={{ position: 'absolute', top: 14, height: 12, left: pct(step.start), width: `${(((step.end - step.start) / span) * 100)}%`, background: '#0f766e', opacity: 0.55, borderRadius: 4 }} />}
        {step.start !== null && step.start !== undefined && <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: pct(step.start), transform: 'translateX(-50%)', fontSize: 12, fontWeight: 700 }}>l</span>}
        {step.start !== null && step.start !== undefined && <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: pct(step.end), transform: 'translateX(-50%)', fontSize: 12, fontWeight: 700 }}>r</span>}
        {xs.map(x => <div key={x} title={`x = ${x}`} style={{ position: 'absolute', top: 24, left: pct(x), width: 14, height: 14, marginLeft: -7, borderRadius: '50%', background: (step.covered || []).includes(x) ? '#0f766e' : 'transparent', border: '2px solid #0f766e' }}>
          <span style={{ position: 'absolute', top: 18, left: -6, fontSize: 12 }}>{x}</span></div>)}
      </div>
      <output aria-label="Rectangle count">{`rectangles so far: ${step.count}${step.start !== null && step.start !== undefined ? `, current reach ${step.start} to ${step.end}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Heights never matter, so each rectangle is just an interval of width w on the x axis.</p>
    <p>Starting from the leftmost uncovered x makes that rectangle reach as far right as possible, which leaves the most room for later points.</p>
  </>} />
}
