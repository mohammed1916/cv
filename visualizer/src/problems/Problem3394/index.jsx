import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Look for two parallel cuts that make three sections.' },
    { id: 'sort', label: 'Sort spans', description: 'Order the rectangles by their start along one axis.' },
    { id: 'group', label: 'Group', description: 'Each span either joins the current section or starts a new one.' },
    { id: 'axis', label: 'Axis result', description: 'Count the sections found along this axis.' },
    { id: 'done', label: 'Complete', description: 'Report whether a pair of cuts works along either axis.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (2 to 12) and rectangles as [startX, startY, endX, endY]',
  url: 'https://leetcode.com/problems/check-if-grid-can-be-cut-into-sections/',
  complexity: 'O(m log m) time for m rectangles, one sort per axis. The visualization caps input at 12 rectangles.',
  examples: [
    { label: 'Two overlapping rectangles', input: '{"n":5,"rectangles":[[0,0,3,2],[2,1,5,4]]}' },
    { label: 'Single strip', input: '{"n":3,"rectangles":[[0,1,1,3]]}' },
    { label: 'Single rectangle', input: '{"n":2,"rectangles":[[0,0,1,1]]}' },
    { label: 'Duplicate rectangles', input: '{"n":4,"rectangles":[[0,0,2,2],[0,0,2,2]]}' },
    { label: 'Whole square', input: '{"n":12,"rectangles":[[0,0,12,12]]}' },
    { label: 'Long run: 12 rectangles', input: '{"n":12,"rectangles":[[3,9,9,11],[1,3,9,11],[2,5,3,11],[5,9,7,10],[10,11,12,12],[9,1,12,2],[3,5,9,9],[6,2,12,11],[4,4,5,8],[5,3,11,11],[3,8,12,10],[0,10,12,12]]}' },
  ],
}

export default function CutIntoSections() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    {step.axis && <p aria-label="Axis">{`Axis: ${step.axis}`}</p>}
    {step.spans.length > 0 && <table aria-label="Spans">
      <thead><tr><th>Start</th><th>End</th><th>Section</th></tr></thead>
      <tbody>{step.spans.map((s, i) => <tr key={i}><td>{s.start}</td><td>{s.end}</td><td>{s.group ?? '-'}</td></tr>)}</tbody>
    </table>}
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A cut is valid when no rectangle crosses it. Merging rectangles whose spans overlap on one axis finds the sections that cannot be split further.</p>
    <p>Two cuts give three sections exactly when the merge produces at least three groups along one axis.</p>
  </>} />
}
