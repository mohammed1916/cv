import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import SvgViewport from '../../components/shared/SvgViewport'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Index', description: 'Hash all points.' },
    { id: 'check', label: 'Check pair', description: 'Test whether the pair can be opposite corners with both others present.' },
    { id: 'found', label: 'Rectangle', description: 'Record a rectangle and update the minimum area.' },
    { id: 'done', label: 'Complete', description: 'Return the minimum area or 0.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Points (JSON [[x,y],...])',
  url: 'https://leetcode.com/problems/minimum-area-rectangle/',
  complexity: 'O(n^2) time and O(n) space. The visualization caps input at 30 points.',
  examples: [
    { label: 'Example 1', input: '[[1,1],[1,3],[3,1],[3,3],[2,2]]' },
    { label: 'Example 2', input: '[[1,1],[1,3],[3,1],[3,3],[4,1],[4,3]]' },
    { label: 'No rectangle', input: '[[0,0],[1,1],[2,0]]' },
  ],
}

function Scatter({ points, step }) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const W = 320, H = 240, pad = 20
  const sx = x => pad + (maxX === minX ? 0.5 : (x - minX) / (maxX - minX)) * (W - 2 * pad)
  const sy = y => H - pad - (maxY === minY ? 0.5 : (y - minY) / (maxY - minY)) * (H - 2 * pad)
  const rect = (r, cls) => r && <rect x={Math.min(sx(r[0]), sx(r[2]))} y={Math.min(sy(r[1]), sy(r[3]))} width={Math.abs(sx(r[0]) - sx(r[2]))} height={Math.abs(sy(r[1]) - sy(r[3]))} fill="none" stroke={cls} strokeWidth="2" strokeDasharray={cls === '#f59e0b' ? '4 3' : undefined} />
  const cand = step.i >= 0 ? [points[step.i][0], points[step.i][1], points[step.j][0], points[step.j][1]] : null
  return <SvgViewport width={W} height={H}>
    {rect(step.bestRect, '#16a34a')}
    {rect(cand, '#f59e0b')}
    {points.map((p, k) => <circle key={k} cx={sx(p[0])} cy={sy(p[1])} r={k === step.i || k === step.j ? 6 : 4} fill={k === step.i || k === step.j ? '#f59e0b' : '#64748b'} />)}
  </SvgViewport>
}

export default function MinimumAreaRectangle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Scatter points={run.input} step={step} />
    <IndexedSequence label="Points" length={run.input.length} active={step.i} valueAt={i => `(${run.input[i].join(',')})`} roleAt={i => i === step.j ? 'left' : ''} />
    <output aria-label="Best area">Best area so far: {step.best ?? 'none'}</output>
  </>} renderReasoning={() => <>
    <p>A rectangle with sides parallel to the axes is determined by two opposite corners. For corners (x1,y1) and (x2,y2) with different x and y, the other corners are (x1,y2) and (x2,y1).</p>
    <p>Checking those two in a hash set makes each pair O(1), so all pairs cost O(n^2).</p>
  </>} />
}
