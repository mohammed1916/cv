import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Angle of forty-five', input: '{"points":[[1,4],[-2,3],[5,-1]],"angle":45,"location":[0,2]}' },
    { label: 'On the viewer', input: '{"points":[[1,1],[2,2],[1,1]],"angle":0,"location":[1,1]}' },
    { label: "Single point", input: "{\"points\":[[1,0]],\"angle\":0,\"location\":[0,0]}" },
    { label: "Point at the viewer", input: "{\"points\":[[0,0],[1,1]],\"angle\":90,\"location\":[0,0]}" },
    { label: "Full turn, points on the edge", input: "{\"points\":[[10,0],[-10,0],[0,10],[0,-10]],\"angle\":360,\"location\":[0,0]}" },
    { label: "Long run: 12 points", input: "{\"points\":[[-9,1],[-3,-5],[-8,-2],[-5,0],[4,-8],[0,9],[9,4],[-7,-5],[0,5],[-7,7],[-4,-7],[-7,0]],\"angle\":90,\"location\":[0,0]}" },
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
      <IndexedSequence label="Sorted directions in degrees (second copy adds 360)" length={step.doubled?.length ?? 0}
        active={step.right ?? -1} valueAt={i => Math.round(step.doubled[i])}
        roleAt={i => (i === step.left ? 'l' : i === step.right ? 'r' : step.left !== null && i > step.left && i < step.right ? 'window' : '')} />
      <output aria-label="Window">{step.phase === 'window' ? `Window holds ${step.count} point(s); best so far ${step.best}` : `Best so far ${step.best} (plus ${step.same} at the viewer)`}</output>
    </>
  }} renderReasoning={() => <>
    <p>From the viewer, each point is one direction. A view of a given width covers a contiguous arc of directions.</p>
    <p>Sorting the directions and sliding a window of that width finds the arc with the most points; points at the viewer always count.</p>
  </>} />
}
