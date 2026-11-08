import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'
import JobView from './JobView'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The job begins at time zero.' },
    { id: 'step', label: 'Step', description: 'A step finishes before the cancel time.' },
    { id: 'cancel', label: 'Cancel', description: 'The next step would finish too late.' },
    { id: 'done', label: 'Result', description: 'Report the outcome.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with steps (durations in ms) and cancelAt',
  url: 'https://leetcode.com/problems/design-cancellable-function/',
  complexity: 'O(steps) time. The visualization models timing only, not the user callback.',
  examples: [
    { label: 'Cancelled midway', input: '{"steps":[20,30,50,10],"cancelAt":60}' },
    { label: 'Finishes first', input: '{"steps":[20,30],"cancelAt":80}' },
    { label: 'Single step, cancelled at start', input: '{"steps":[5],"cancelAt":0}' },
    { label: 'Cancel lands on a step boundary', input: '{"steps":[20,30,50],"cancelAt":50}' },
    { label: 'Largest job: 8 steps of 100', input: '{"steps":[100,100,100,100,100,100,100,100],"cancelAt":1000}' },
    { label: 'Long run: 8 steps, cancel at 400', input: '{"steps":[97,86,70,91,47,89,25,71],"cancelAt":400}' },
  ],
}

export default function DesignCancellableFunction() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <JobView run={run} step={step} />} renderReasoning={() => <>
    <p>Cancel is checked before each step is allowed to complete. Steps already finished stay finished; the one that would end after the cancel point gets the Cancelled error instead.</p>
    <p>If the job finishes first, its return value is the promise's result.</p>
  </>} />
}
