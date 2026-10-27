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
    { label: 'Example 1', input: '{"n":5,"rectangles":[[1,0,5,2],[0,2,2,4],[3,2,5,3],[0,4,4,5]]}' },
    { label: 'Example 3', input: '{"n":4,"rectangles":[[0,2,2,4],[1,0,3,2],[2,2,3,4],[3,0,4,2],[3,2,4,4]]}' },
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
