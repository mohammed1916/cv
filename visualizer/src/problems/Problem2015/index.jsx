import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2015',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Buildings as [start, end, height] (JSON)',
  url: 'https://leetcode.com/problems/average-height-of-buildings-in-each-segment/',
  complexity: 'O(b log b) time for b buildings: sort the boundaries, then one sweep.',
  examples: [
    { label: 'Overlap', input: '[[2,5,8],[3,6,4]]' },
    { label: 'Equal averages', input: '[[1,3,4],[3,6,4]]' },
    { label: 'Single', input: '[[2,4,9]]' },
  ],
}

export default function AverageHeightOfBuildings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { buildings, points, point, segments, sum, count } = step.snapshot
    const lo = points[0] ?? 0, hi = points[points.length - 1] ?? 1
    const span = Math.max(1, hi - lo)
    const pct = v => `${((v - lo) / span) * 100}%`
    return <>
      <div aria-label="Buildings and output segments" style={{ position: 'relative', height: 16 + (buildings.length + 1) * 14, margin: '8px 0' }}>
        {buildings.map(([s, e, h], i) => <div key={i} title={`[${s}, ${e}) height ${h}`} style={{
          position: 'absolute', top: 4 + i * 14, height: 10, left: pct(s), width: `${((e - s) / span) * 100}%`,
          background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 3,
        }} />)}
        {segments.map(([l, r, avg], i) => <div key={`s${i}`} title={`[${l}, ${r}) average ${avg}`} style={{
          position: 'absolute', top: 6 + buildings.length * 14, height: 10, left: pct(l), width: `${((r - l) / span) * 100}%`,
          background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: 3,
        }} />)}
        {point !== null && point !== undefined && <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(point), width: 2, background: 'var(--text)' }} />}
      </div>
      <p>Sweep at <strong>{point ?? '-'}</strong>: {count} building(s) cover the stretch from l = {point ?? '-'} to r = {points[points.indexOf(point) + 1] ?? '-'}, total height {sum}.</p>
      <p>Segments so far: {segments.length ? segments.map(([l, r, a]) => `[${l}, ${r}) avg ${a}`).join(' · ') : 'none'}</p>
    </>
  }} renderReasoning={() => <p>Between consecutive boundaries nothing changes, so each stretch has one floored average. Stretches with the same average that touch are merged into one segment.</p>} />
}
