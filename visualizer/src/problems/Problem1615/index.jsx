import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1615',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and roads (JSON)',
  url: 'https://leetcode.com/problems/maximal-network-rank/',
  complexity: 'O(n + r) to count degrees and O(n^2) to check every pair, where r is the number of roads.',
  examples: [
    { label: 'Hub city', input: '{"n":5,"roads":[[0,2],[1,2],[2,3],[2,4],[3,4]]}' },
    { label: 'Chain', input: '{"n":3,"roads":[[0,1],[1,2]]}' },
    { label: 'Disjoint roads', input: '{"n":4,"roads":[[0,1],[2,3]]}' },
  ],
}

// Cities sit on a circle. Roads drawn solid; the pair being ranked is highlighted.
function CityMap({ n, roads, pair }) {
  const size = 260, radius = 100
  const point = city => {
    const angle = (2 * Math.PI * city) / n - Math.PI / 2
    return { x: size / 2 + radius * Math.cos(angle), y: size / 2 + radius * Math.sin(angle) }
  }
  const isPairRoad = ([a, b]) => pair && ((a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]))
  return <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 300 }} role="img" aria-label="Cities and roads">
    {roads.map(([a, b], k) => {
      const p = point(a), q = point(b)
      return <line key={k} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={isPairRoad([a, b]) ? 'var(--primary)' : 'var(--text-muted)'} strokeWidth={isPairRoad([a, b]) ? 4 : 2} />
    })}
    {Array.from({ length: n }, (_, city) => {
      const p = point(city)
      const inPair = pair && pair.includes(city)
      return <g key={city}>
        <circle cx={p.x} cy={p.y} r={16} fill={inPair ? 'var(--primary)' : 'var(--surface)'} stroke="var(--text)" strokeWidth={1.5} />
        <text x={p.x} y={p.y + 4} textAnchor="middle" fill={inPair ? 'var(--surface)' : 'var(--text)'} fontSize="13" fontFamily="monospace">{city}</text>
      </g>
    })}
  </svg>
}

export default function NetworkRank() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, degree, pair, rank, shared } = step.snapshot
    const inPair = city => pair && pair.includes(city)
    return <>
      <CityMap n={run.input.n} roads={run.input.roads} pair={pair} />
      <div role="img" aria-label="City degrees" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
        {Array.from({ length: n }, (_, city) => <div key={city} style={{
          minWidth: 72, padding: 8, textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: `${inPair(city) ? 2 : 1}px solid ${inPair(city) ? 'var(--text)' : 'var(--border)'}`,
          background: inPair(city) ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
        }}><div>city {city}</div><strong>degree {degree[city]}</strong></div>)}
      </div>
      <p>{pair ? `Pair ${pair[0]} and ${pair[1]}: rank ${rank}${shared ? ' (shared road subtracted)' : ''}.` : 'Degrees are counted from the roads.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Degrees first:</strong> a city's degree is the number of roads attached to it.</p>
    <p><strong>Shared road once:</strong> a direct road between two cities is in both degrees, so it is subtracted exactly once.</p>
  </>} />
}
