import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'x', label: 'x overlap', description: 'Check the horizontal ranges.' },
    { id: 'y', label: 'y overlap', description: 'Check the vertical ranges.' },
    { id: 'done', label: 'Verdict', description: 'Both axes must overlap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'rec1 and rec2 (JSON object of [x1, y1, x2, y2])',
  url: 'https://leetcode.com/problems/rectangle-overlap/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Corner', input: '{"rec1":[0,0,4,3],"rec2":[2,1,6,5]}' },
    { label: 'Touching', input: '{"rec1":[0,0,2,2],"rec2":[2,0,4,2]}' },
    { label: 'Apart', input: '{"rec1":[-3,-3,-1,-1],"rec2":[1,1,3,3]}' },
    { label: 'Identical rectangles', input: '{"rec1":[0,0,1,1],"rec2":[0,0,1,1]}' },
    { label: 'Extreme coordinates overlap', input: '{"rec1":[-1000,-1000,1000,1000],"rec2":[999,999,1000,1000]}' },
    { label: 'Extreme corners apart', input: '{"rec1":[-1000,-1000,-999,-999],"rec2":[999,999,1000,1000]}' },
    { label: 'Long run: random rectangles', input: '{"rec1":[-120,-800,787,-433],"rec2":[-352,307,496,810]}' },
  ],
}

function Scene({ rec1, rec2 }) {
  const all = [...rec1, ...rec2]
  const lo = Math.min(...all), hi = Math.max(...all)
  const span = Math.max(1, hi - lo)
  const scale = 240 / span
  const box = ([x1, y1, x2, y2]) => ({ x: (x1 - lo) * scale + 20, y: 260 - ((y2 - lo) * scale + 20), w: (x2 - x1) * scale, h: (y2 - y1) * scale })
  const a = box(rec1), b = box(rec2)
  return <svg viewBox="0 0 280 280" width="100%" role="img" aria-label="Two rectangles on a plane" style={{ maxWidth: 320 }}>
    <rect x={a.x} y={a.y} width={a.w} height={a.h} fill="var(--primary)" fillOpacity="0.25" stroke="var(--primary)" strokeWidth="2" />
    <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="var(--surface2)" fillOpacity="0.6" stroke="var(--text)" strokeWidth="2" />
  </svg>
}

export default function RectangleOverlap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Scene rec1={run.input.rec1} rec2={run.input.rec2} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The rectangles overlap exactly when their projections on both axes overlap. Strict inequalities mean rectangles that only share an edge do not count.</p>
  </>} />
}
