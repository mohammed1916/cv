import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2008',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Road length n and rides [start, end, tip] (JSON)',
  url: 'https://leetcode.com/problems/maximum-earnings-from-taxi/',
  complexity: 'O(n + r) time: one pass over the points and the rides that end at each point.',
  examples: [
    { label: 'Two choices', input: '{"n":6,"rides":[[1,4,2],[4,6,1],[2,6,5]]}' },
    { label: 'Single ride', input: '{"n":4,"rides":[[1,4,3]]}' },
  ],
}

export default function MaximumEarningsFromTaxi() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { n, rides, x, best, chosen } = step.snapshot
    const pct = v => `${((v - 1) / Math.max(1, n - 1)) * 100}%`
    return <>
      <div aria-label="Road with rides" style={{ position: 'relative', height: 90, margin: '8px 0' }}>
        <div style={{ position: 'absolute', top: 40, left: 0, right: 0, height: 2, background: 'var(--border)' }} />
        {Array.from({ length: n }, (_, i) => i + 1).map(p => <span key={p} style={{
          position: 'absolute', top: 46, left: pct(p), transform: 'translateX(-50%)', fontSize: 11, color: 'var(--text-muted)',
        }}>{p}</span>)}
        {rides.map(([s, e, tip], i) => <div key={i} title={`ride ${s} to ${e}, tip ${tip}`} style={{
          position: 'absolute', top: 8 + (i % 3) * 10, left: pct(s), width: `${((e - s) / Math.max(1, n - 1)) * 100}%`,
          height: 8, borderRadius: 4,
          background: chosen && chosen[0] === s && chosen[1] === e ? 'var(--primary)' : 'var(--surface2)',
          border: '1px solid var(--border)',
        }} />)}
      </div>
      <p>Point <strong>{x}</strong>: best earnings so far <strong>{best[x]}</strong>. Earnings by point: {best.join(', ')}.</p>
      {chosen && <p>Ride {chosen[0]} → {chosen[1]} sets the new best here.</p>}
    </>
  }} renderReasoning={() => <p>Walking the road left to right, the best total at each point is either carried from the previous point or obtained by finishing a ride here and adding the best total at the ride's start.</p>} />
}
