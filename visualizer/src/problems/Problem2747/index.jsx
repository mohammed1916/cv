import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "setup",
    "label": "Setup",
    "description": "Start with an empty answer list."
  },
  {
    "id": "query",
    "label": "Query",
    "description": "Take the next query and an empty busy set."
  },
  {
    "id": "log",
    "label": "Log",
    "description": "Read one request log."
  },
  {
    "id": "check",
    "label": "Check",
    "description": "Test whether the log falls in the window."
  },
  {
    "id": "mark",
    "label": "Mark",
    "description": "Mark the server as busy."
  },
  {
    "id": "answer",
    "label": "Answer",
    "description": "Count the idle servers for this query."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Return the answers."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with n, logs, x, queries (JSON), e.g. {\"n\":3,\"logs\":[[1,3],[2,6],[1,5]],\"x\":5,\"queries\":[10,11]}",
  url: "https://leetcode.com/problems/count-zero-request-servers/",
  complexity: "O(queries * logs) time for this visualization, which caps input at 10 servers, 10 logs and 10 queries. The official limit is 10^5 for each.",
  examples: [
  {
    "label": "Window slides",
    "input": "{\"n\":4,\"logs\":[[2,4],[3,9],[2,12],[4,7]],\"x\":4,\"queries\":[9,12,15]}"
  },
  { label: 'Single server', input: '{"n":1,"logs":[[1,5]],"x":3,"queries":[5]}' },
  { label: 'Equal times', input: '{"n":2,"logs":[[1,10],[2,10]],"x":10,"queries":[10,20]}' },
  { label: 'Largest window', input: '{"n":10,"logs":[[10,100],[1,1]],"x":100,"queries":[100,1]}' },
  { label: 'Long run: 10 logs', input: '{"n":10,"logs":[[3,76],[10,73],[5,18],[2,15],[7,60],[4,57],[9,2],[6,99],[1,44],[8,41]],"x":40,"queries":[73,66,75,8,93,74,91,36,5,38]}' },
],
}


// Timeline: one row per server, request times as dots, and the query window [l, r] = [q - x, q] shaded.
function Timeline({ run, step }) {
  const { n, logs, x, queries } = run.input
  const times = [...logs.map(([, t]) => t), ...queries]
  const lo = Math.min(0, ...times), hi = Math.max(...times) + 1
  const span = Math.max(1, hi - lo)
  const W = 320, LEFT = 56, ROW = 26, TOP = 22
  const H = TOP + n * ROW + 10
  const sx = t => LEFT + ((t - lo) / span) * (W - LEFT - 12)
  const q = step.query >= 0 ? step.query : null
  return <figure aria-label="Request timeline" style={{ margin: '0 0 12px' }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 360, display: 'block' }} role="img" aria-label="Server request times with the query window">
      {q !== null && <rect x={sx(q - x)} y={TOP - 6} width={Math.max(2, sx(q) - sx(q - x))} height={n * ROW + 8} fill="var(--primary)" opacity="0.14" />}
      {q !== null && <>
        <line x1={sx(q - x)} x2={sx(q - x)} y1={TOP - 6} y2={TOP + n * ROW + 2} stroke="var(--text)" strokeDasharray="4 3" />
        <text x={sx(q - x)} y={TOP - 9} fontSize="11" fill="var(--text)" textAnchor="middle">l={q - x}</text>
        <line x1={sx(q)} x2={sx(q)} y1={TOP - 6} y2={TOP + n * ROW + 2} stroke="var(--text)" strokeDasharray="4 3" />
        <text x={sx(q)} y={TOP - 9} fontSize="11" fill="var(--text)" textAnchor="middle">r={q}</text>
      </>}
      {Array.from({ length: n }, (_, i) => {
        const server = i + 1, y = TOP + i * ROW + ROW / 2, busy = step.busy.includes(server)
        return <g key={server}>
          <text x={LEFT - 8} y={y + 4} fontSize="12" fill="var(--text)" textAnchor="end" fontWeight={busy ? 700 : 400}>{`server ${server}`}</text>
          <line x1={LEFT} x2={W - 12} y1={y} y2={y} stroke="var(--text)" opacity="0.2" />
          {logs.filter(([s]) => s === server).map(([, t], k) => {
            const inside = q !== null && q - x <= t && t <= q
            return <circle key={k} cx={sx(t)} cy={y} r={inside ? 6 : 4} fill={inside ? 'var(--primary)' : 'var(--surface2)'} stroke="var(--text)" />
          })}
        </g>
      })}
    </svg>
    <figcaption style={{ color: 'var(--text)' }}>{q === null ? 'Each dot is one request time.' : `Query ${q}: requests between l and r count; a server with a filled dot inside the band is busy.`}</figcaption>
  </figure>
}

export default function CountZeroRequestServersVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Timeline run={run} step={step} />
    <output aria-label="Answers">{`Query ${step.query >= 0 ? step.query : '-'}, answers [${step.answer.join(', ')}]`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
