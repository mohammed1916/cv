import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2021',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lamps as [position, range] pairs (JSON)',
  url: 'https://leetcode.com/problems/brightest-position-on-street/',
  complexity: 'O(k log k) time for k event positions (at most twice the number of lamps).',
  examples: [
    { label: 'Brightest at zero', input: '[[0,1],[4,2],[2,0]]' },
    { label: 'Tie breaks left', input: '[[1,1],[5,1]]' },
    { label: 'Single lamp', input: '[[3,2]]' },
  ],
}

export default function BrightestPositionOnStreet() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { lights, points, point, brightness, best, answer } = step.snapshot
    const lo = Math.min(...lights.map(([p, r]) => p - r)), hi = Math.max(...lights.map(([p, r]) => p + r))
    const span = Math.max(1, hi - lo)
    const pct = v => `${((v - lo) / span) * 100}%`
    return <>
      <div aria-label="Street lamps on the number line" style={{ position: 'relative', height: 16 + lights.length * 12, margin: '8px 0' }}>
        {lights.map(([p, r], i) => <div key={i} style={{
          position: 'absolute', top: 4 + i * 12, height: 8, left: pct(p - r), width: `${(2 * r / span) * 100}%`,
          background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4,
        }} title={`lamp at ${p} range ${r}`} />)}
        {point !== null && <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(point), width: 2, background: 'var(--primary)' }} />}
      </div>
      <p>Event positions: {points.join(', ')}. Sweep at <strong>{point ?? '-'}</strong> gives brightness <strong>{brightness}</strong>.</p>
      <p>Brightest so far: <strong>{best}</strong> at position <strong>{answer}</strong>.</p>
    </>
  }} renderReasoning={() => <p>Brightness changes only at interval ends, so checking the event positions in order finds every brightness level. The first strict increase gives the leftmost brightest position.</p>} />
}
