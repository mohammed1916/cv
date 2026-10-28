import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with zero time and zero skips.' },
    { id: 'rest', label: 'Rest or skip', description: 'After a road, either rest to a whole hour or skip the rest.' },
    { id: 'last', label: 'Last road', description: 'The final road has no rest, so the time is not rounded.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest skips that arrive by the meeting time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with dist, speed, and hours_before (JSON)',
  url: 'https://leetcode.com/problems/minimum-skips-to-arrive-at-meeting-on-time/',
  complexity: 'O(n^2) time and O(n) space for n roads. The visualization caps input at 5 roads.',
  examples: [
    { label: 'Example 1', input: '{"dist":[1,3,2],"speed":4,"hours_before":2}' },
    { label: 'Example 2', input: '{"dist":[7,3,5,5],"speed":2,"hours_before":10}' },
  ],
}

export default function MinimumSkipsMeeting() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Skip count" length={step.times.length} valueAt={i => (step.times[i] === null ? 'none' : `${step.times[i].toFixed(2)} h`)}
      active={-1} roleAt={i => (step.times[i] !== null && step.times[i] <= run.input.hours_before ? 'in time' : '')} />
    <output aria-label="Result">{`Road ${step.road < 0 ? '-' : step.road + 1} of ${run.input.dist.length}; meeting in ${run.input.hours_before} hours`}</output>
  </>} renderReasoning={() => <>
    <p>After each road but the last, the rider either rests until a whole hour or skips the rest and keeps the exact time.</p>
    <p>Each skip count keeps only its earliest arrival time, so the first skip count that meets the deadline is the answer.</p>
  </>} />
}
