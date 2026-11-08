import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the points and the queries by their first value.' },
    { id: 'insert', label: 'Insert', description: 'Add a point to the frontier, or skip it when dominated.' },
    { id: 'query', label: 'Query', description: 'Find the best frontier point inside the query quadrant.' },
    { id: 'done', label: 'Result', description: 'Report the answers in input order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1, nums2 (equal length) and queries ([x, y] pairs)',
  url: 'https://leetcode.com/problems/maximum-sum-queries/',
  complexity: 'O((n + q) log(n + q)) time with a monotonic frontier and binary search in the full version. This visualization uses a linear frontier scan and caps n at 8 and q at 6.',
  examples: [
    { label: 'Three points, three queries', input: '{"nums1":[6,2,7,3],"nums2":[1,8,4,5],"queries":[[3,4],[6,1],[1,9]]}' },
    { label: 'Equal points', input: '{"nums1":[5,5],"nums2":[5,5],"queries":[[5,5],[6,1]]}' },
    { label: 'Single point', input: '{"nums1":[1],"nums2":[20],"queries":[[10,10]]}' },
    { label: 'Equal points tie', input: '{"nums1":[4,4],"nums2":[4,4],"queries":[[4,4]]}' },
    { label: 'Largest values', input: '{"nums1":[20,20,20,20,20,20,20,20],"nums2":[1,1,1,1,1,1,1,1],"queries":[[20,1],[1,20],[10,10],[20,20],[1,1],[5,5]]}' },
    { label: 'Long run: 8 points, 6 queries', input: '{"nums1":[6,7,20,9,10,19,12,13],"nums2":[14,3,16,1,6,19,12,17],"queries":[[19,12],[16,9],[1,18],[18,7],[3,4],[20,13]]}' },
  ],
}

// Scatter of points (nums1 across, nums2 up) with the query quadrant and the frontier staircase.
function Scatter({ run, step }) {
  const { nums1, nums2, queries } = run.input
  const q = step.query >= 0 ? queries[step.query] : null
  const W = 300, H = 300, P = 28
  const top = Math.max(...nums1, ...nums2, ...queries.flat()) + 1
  const sx = v => P + (v / top) * (W - 2 * P)
  const sy = v => H - P - (v / top) * (H - 2 * P)
  const points = nums1.map((a, i) => ({ a, b: nums2[i], i }))
  const frontier = [...step.frontier].sort((u, v) => u.y - v.y)
  return <figure aria-label="Points and query quadrant" style={{ margin: '0 0 12px' }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 340, display: 'block' }} role="img" aria-label="Scatter of points with the query quadrant">
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="var(--text)" opacity="0.5" />
      <line x1={P} y1={P} x2={P} y2={H - P} stroke="var(--text)" opacity="0.5" />
      <text x={W - P} y={H - P + 16} fontSize="11" fill="var(--text)" textAnchor="end">nums1</text>
      <text x={P - 4} y={P - 6} fontSize="11" fill="var(--text)">nums2</text>
      {q && <rect x={sx(q[0])} y={sy(top)} width={sx(top) - sx(q[0])} height={sy(q[1]) - sy(top)} fill="var(--primary)" opacity="0.12" />}
      {frontier.length > 1 && <polyline fill="none" stroke="var(--primary)" strokeWidth="2" points={frontier.map(f => `${sx(f.s - f.y)},${sy(f.y)}`).join(' ')} />}
      {points.map(({ a, b, i }) => {
        const considered = q ? a >= q[0] : false
        const current = step.point && step.point.a === a && step.point.b === b
        return <g key={i}>
          <circle cx={sx(a)} cy={sy(b)} r={current ? 7 : 5} fill={considered ? 'var(--primary)' : 'var(--surface2)'} stroke="var(--text)" opacity={considered ? 1 : 0.5} />
          <text x={sx(a) + 7} y={sy(b) - 6} fontSize="10" fill="var(--text)">{`${a},${b}`}</text>
        </g>
      })}
      {q && <circle cx={sx(q[0])} cy={sy(q[1])} r="4" fill="none" stroke="var(--text)" strokeDasharray="3 2" />}
    </svg>
    <figcaption style={{ color: 'var(--text)' }}>{q ? `Query (${q[0]}, ${q[1]}): points in the shaded quadrant are candidates; the line is the frontier.` : 'Each point is (nums1, nums2); the line is the frontier of points kept so far.'}</figcaption>
  </figure>
}

export default function MaximumSumQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Scatter run={run} step={step} />
    <output aria-label="Frontier">{`frontier (y, sum) = [${step.frontier.map(f => `(${f.y}, ${f.s})`).join(', ')}]; answers = [${step.answer.join(', ')}]`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Process the queries from the largest x down. Each point with nums1 at least x is added once. A point is kept only if no other kept point is at least as high in nums2 and at least as large in sum.</p>
    <p>The kept points form a staircase: the first one whose nums2 reaches the query's y has the best sum for that query.</p>
  </>} />
}
