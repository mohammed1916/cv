import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing has been compared yet.' },
    { id: 'task', label: 'Task', description: 'Measure this task and keep the employee with the longest one.' },
    { id: 'done', label: 'Complete', description: 'Report the employee who worked the longest task.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and logs of [id, leaveTime] (JSON)',
  url: 'https://leetcode.com/problems/the-employee-that-worked-on-the-longest-task/',
  complexity: 'O(m) time and O(1) extra space for m logs.',
  examples: [
    { label: 'Clear winner', input: '{"n":3,"logs":[[2,4],[0,7],[1,9],[2,12]]}' },
    { label: 'Tie', input: '{"n":3,"logs":[[1,6],[0,9],[2,12]]}' },
  ],
}

export default function LongestTask() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Tasks (duration)" length={run.input.logs.length} active={step.index}
      valueAt={index => `E${run.input.logs[index][0]}: ${run.durations[index]}`}
      roleAt={index => (index < step.index ? 'done' : '')} />
    <output aria-label="Longest task">{`Longest so far: employee ${step.answer}`}</output>
  </>} renderReasoning={() => <>
    <p>Task k starts when task k minus one ends, so each duration is the difference between consecutive leave times.</p>
    <p>A tie in duration is resolved by the smaller employee id, which the comparison checks explicitly.</p>
  </>} />
}
