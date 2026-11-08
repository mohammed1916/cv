import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Handle tasks in order of their end time.' },
    { id: 'on', label: 'Turn on', description: 'Switch the computer on at the latest free second in the window.' },
    { id: 'done', label: 'Complete', description: 'Report the number of seconds the computer is on.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with tasks: up to 3 entries of [start, end, duration] (times 1 to 10)',
  url: 'https://leetcode.com/problems/minimum-time-to-complete-all-tasks/',
  complexity: 'O(n log n + n * H) time for the sort and the window scans, where H is the largest end time. The visualization caps input at 3 tasks and times at 10.',
  examples: [
    { label: 'Example 1', input: '{"tasks":[[2,3,1],[4,5,1],[1,5,2]]}' },
    { label: 'Example 2', input: '{"tasks":[[1,3,2],[2,5,3],[5,6,2]]}' },
    { label: 'Single one-slot task', input: '{"tasks":[[4,4,1]]}' },
    { label: 'Identical tasks tie', input: '{"tasks":[[1,3,2],[1,3,2]]}' },
    { label: 'Full-range task and tight task', input: '{"tasks":[[1,10,10],[1,10,1],[5,10,6]]}' },
    { label: 'Long run: three overlapping tasks', input: '{"tasks":[[1,10,4],[3,9,5],[2,8,2]]}' },
  ],
}

export default function MinimumTimeCompleteTasks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Seconds 1 to the last deadline (on = filled)" length={step.on.length - 1} valueAt={i => (step.on[i + 1] ? 'on' : 'off')} indexOffset={1} active={step.index >= 1 ? step.index - 1 : -1} roleAt={i => (step.on[i + 1] ? 'on' : '')} />
    <output aria-label="Seconds on">{`Seconds on so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>While the computer is on it can run every task whose window contains that second, so only the number of on-seconds inside each window matters.</p>
    <p>Handling tasks by deadline and placing new on-seconds as late as possible leaves earlier seconds free for tasks that end sooner.</p>
  </>} />
}
