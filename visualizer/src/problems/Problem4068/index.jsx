import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MeetingTimelineView from './MeetingTimelineView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4068',
  phases: [
    { id: 'sort', label: 'Order', description: 'Sort meetings by start time.' },
    { id: 'pool', label: 'Finished', description: 'Add a meeting that ends before this start.' },
    { id: 'extend', label: 'Extend', description: 'Attach this meeting after the best finished one.' },
    { id: 'done', label: 'Result', description: 'Report the largest chain total.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of [start, end, revenue] triples, e.g. [[1, 3, 5], [3, 6, 4]]',
  url: 'https://leetcode.com/problems/maximize-meeting-earnings-with-idle-gaps/',
  complexity: 'O(n log n) time for sorting and the sweep, O(n) space. The visualization caps the input at 12 meetings; the official limit is 100000.',
  examples: [
    { label: 'Gap pays', input: '[[1, 2, 10], [3, 4, 2]]' },
    { label: 'Overlap choice', input: '[[0, 4, 6], [2, 9, 8], [9, 12, 3]]' },
  ],
}

export default function MaximizeMeetingEarningsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MeetingTimelineView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Maximum earnings: ${run.result}.` : ''}
        </p>
      )}
    />
  )
}
