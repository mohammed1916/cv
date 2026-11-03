import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Tasks', description: 'Compute each task end time.' },
    { id: 'done', label: 'Result', description: 'The smallest end time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of [start, duration] pairs',
  url: 'https://leetcode.com/problems/earliest-time-to-finish-one-task/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example', input: '[[4,9],[10,1],[3,20]]' },
    { label: 'Single task', input: '[[50,50]]' },
  ],
}

export default function EarliestTimeToFinishOneTask() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="tasks" length={run.input.tasks.length} valueAt={i => `[${run.input.tasks[i].join(', ')}]`} active={step.at}
      roleAt={i => (i === step.bestIndex ? 'best' : '')} />
    <output aria-label="Best finish">{step.finish === null ? `earliest finish ${step.best}` : `task ends at ${step.finish}; best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A task finishes once start plus duration units have passed. Nothing else matters for this question, so the answer is the smallest such sum.</p>
    <p>Tracking a running minimum lets one pass over the list answer it.</p>
  </>} />
}
