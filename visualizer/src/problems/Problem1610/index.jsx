import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Viewer', description: 'Points on the viewer are always visible.' },
    { id: 'window', label: 'Window', description: 'Slide the view window across the sorted angles.' },
    { id: 'done', label: 'Complete', description: 'Report the most visible points.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"points": [[x, y], ...], "angle": 0-360, "location": [x, y]}',
  url: 'https://leetcode.com/problems/maximum-number-of-visible-points/',
  complexity: 'O(n log n) time for n points, from the sort. The visualization caps input at 12 points.',
  examples: [
    { label: 'Example 1', input: '{"points":[[2,1],[2,2],[3,3]],"angle":90,"location":[1,1]}' },
    { label: 'On the viewer', input: '{"points":[[1,1],[2,2],[1,1]],"angle":0,"location":[1,1]}' },
  ],
}

const inWindow = (deg, start, width) => start !== null && (((deg - start) % 360 + 360) % 360) <= width + 1e-9

export default function MaxVisiblePoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { points, angle, location } = run.input
    const [lx, ly] = location
    const drawn = points.map(([x, y]) => {
      const deg = x === lx && y === ly ? null : Math.atan2(y - ly, x - lx) * (180 / Math.PI)
      const active = deg !== null && inWindow(deg, step.start, angle)
      return { x, y, role: active ? 'active' : undefined }
    })
    const wedge = { cx: lx, cy: ly, startDeg: step.start ?? 0, widthDeg: angle, label: 'view' }
    return <>
      <CoordinatePlane title="Viewer and visible points" points={drawn} wedge={step.start !== null ? wedge : null} />
      <output aria-label="Window">{step.phase === 'window' ? `Window holds ${step.count} point(s); best so far ${step.best}` : `Best so far ${step.best} (plus ${step.same} at the viewer)`}</output>
    </>
  }} renderReasoning={() => <>
    <p>From the viewer, each point is one direction. A view of a given width covers a contiguous arc of directions.</p>
    <p>Sorting the directions and sliding a window of that width finds the arc with the most points; points at the viewer always count.</p>
  </>} />
}
