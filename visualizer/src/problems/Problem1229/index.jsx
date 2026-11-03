import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TimelineMeetingView from './TimelineMeetingView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1229',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with slots1, slots2 ([start, end] pairs) and duration',
  url: 'https://leetcode.com/problems/meeting-scheduler/description/',
  complexity: 'O(n log n + m log m) time for the sorts, then O(n + m) for the pointer walk. The visualization caps each person at 10 slots; the draft does not state an exact official bound.',
  examples: [
    { label: 'Found later', input: '{"slots1":[[10,40],[70,130]],"slots2":[[0,12],[62,80]],"duration":9}' },
    { label: 'Immediate', input: '{"slots1":[[1,5]],"slots2":[[2,9]],"duration":3}' },
    { label: 'None', input: '{"slots1":[[1,5]],"slots2":[[6,9]],"duration":2}' },
  ],
}

export default function Problem1229MeetingScheduler() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TimelineMeetingView run={run} step={step} />}
      renderReasoning={() => (
        <p>Both lists are sorted by start, so each comparison looks at the one pair that can still overlap. The earlier-ending slot is dropped because no later slot in the other list can start before it ends.</p>
      )}
    />
  )
}
