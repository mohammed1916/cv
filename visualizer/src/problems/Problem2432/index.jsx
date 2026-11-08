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
    { label: 'Single log', input: '{"n":2,"logs":[[1,5]]}' },
    { label: 'Equal counts', input: '{"n":3,"logs":[[0,2],[1,4],[2,6]]}' },
    { label: 'Largest values', input: '{"n":20,"logs":[[0,10],[1,20],[2,30],[3,40],[4,50],[5,60],[6,70],[7,80],[8,90],[9,100],[10,110],[11,120],[12,130],[13,140],[14,150],[15,160],[16,170],[17,180],[18,190],[19,200]]}' },
    { label: 'Long run: 20 logs', input: '{"n":20,"logs":[[19,3],[12,5],[2,12],[18,13],[10,16],[9,17],[0,18],[9,25],[14,33],[18,39],[16,40],[7,42],[4,51],[7,59],[16,62],[18,68],[11,76],[13,82],[16,89],[0,97]]}' },
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
