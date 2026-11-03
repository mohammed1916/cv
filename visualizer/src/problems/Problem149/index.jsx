import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '149',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a points list of [x, y] pairs (JSON)',
  url: 'https://leetcode.com/problems/max-points-on-a-line/',
  complexity: 'O(n^2) time with a hash map of reduced directions for each anchor, and O(n) extra space per anchor.',
  examples: [
    { label: 'Diagonal with an outlier', input: '{"points":[[1,1],[2,2],[3,3],[0,5]]}' },
    { label: 'Four scattered points', input: '{"points":[[0,0],[1,2],[2,1],[3,3]]}' },
    { label: 'Two points', input: '{"points":[[0,0],[5,5]]}' },
  ],
}

const toX = value => 10 + ((value + 100) / 200) * 280
const toY = value => 290 - ((value + 100) / 200) * 280

export default function MaxPointsOnLine() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { points } = run.input
    const { anchor, other, slopes, best } = step.snapshot
    return <>
      <svg role="img" aria-label="Points on the plane" viewBox="0 0 300 300" width="100%" style={{ maxWidth: 320, border: '1px solid var(--border)' }}>
        {anchor !== null && other !== null && <line x1={toX(points[anchor][0])} y1={toY(points[anchor][1])}
          x2={toX(points[other][0])} y2={toY(points[other][1])} stroke="#f59e0b" strokeWidth={2} />}
        {points.map(([x, y], i) => <g key={i} data-point={i}>
          <circle cx={toX(x)} cy={toY(y)} r={i === anchor ? 6 : 4}
            fill={i === anchor ? '#ef4444' : i === other ? '#f59e0b' : '#0891b2'} />
          <text x={toX(x) + 6} y={toY(y) - 6} fontSize="10">{i}</text>
        </g>)}
      </svg>
      <p>Best so far: {best}</p>
      <table aria-label="Direction buckets" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>direction</th><th>later points</th></tr></thead>
        <tbody>{slopes.length === 0 ? <tr><td colSpan={2}>none yet</td></tr>
          : slopes.map(entry => <tr key={entry.key}><td>{entry.key}</td><td>{entry.count}</td></tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={() => <>
    <p><strong>Fix an anchor:</strong> every line with two or more points has a first point, so counting only later points from each anchor finds every line once.</p>
    <p><strong>Reduce directions:</strong> dividing the offset by its gcd and fixing the sign makes equal slopes share one key, with no floating-point error.</p>
  </>} />
}
