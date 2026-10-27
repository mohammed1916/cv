import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import IntervalView from '../../components/shared/IntervalView'
import { buildTrace, parseInput, code, python, viewFor } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No busy days yet.' },
    { id: 'merge', label: 'Merge meeting', description: 'Fold a meeting into the current busy block.' },
    { id: 'done', label: 'Complete', description: 'Subtract the busy days from the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"days": 1-30, "meetings": [[start, end], ...]}',
  url: 'https://leetcode.com/problems/count-days-without-meetings/',
  complexity: 'O(m log m) time for m meetings, O(days) for the day strip in this visualization.',
  examples: [
    { label: 'Overlapping', input: '{"days":10,"meetings":[[5,7],[1,3],[3,6]]}' },
    { label: 'Covered', input: '{"days":5,"meetings":[[2,4],[1,5]]}' },
  ],
}

export default function CountDaysWithoutMeetings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const view = viewFor(run, step)
    return <>
      {view && <IntervalView {...view} />}
      <IndexedSequence label="Day" length={run.input.days} indexOffset={1} active={step.meeting ? step.meeting[0] - 1 : -1}
        valueAt={i => (step.busy[i] ? 'busy' : 'free')} roleAt={i => (step.busy[i] ? 'busy' : '')} />
      <output aria-label="Covered days">{`Busy days so far: ${step.covered}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Meetings that overlap or touch form one busy block, so the busy days are the total length of the merged blocks.</p>
    <p>Subtracting the busy days from the total leaves the free days.</p>
  </>} />
}
