import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Baseline', description: 'Every task starts on technique 2.' },
    { id: 'take', label: 'Switch', description: 'Switch a task with the next largest gain.' },
    { id: 'skip', label: 'Keep', description: 'Leave a task on technique 2 when its gain does not help.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tasks (JSON object with technique1, technique2, k)',
  url: 'https://leetcode.com/problems/maximize-points-after-choosing-k-tasks/',
  complexity: 'O(n log n) time for sorting the gains. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"technique1":[5,2,10],"technique2":[10,3,8],"k":2}' },
    { label: 'Example 3', input: '{"technique1":[1,2,3],"technique2":[4,5,6],"k":0}' },
  ],
}

export default function MaximizePointsAfterChoosingKTasks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <IndexedSequence label="Gains, largest first" length={step.sorted.length} valueAt={i => step.sorted[i]}
      active={step.index} roleAt={i => (step.index >= 0 && i <= step.index ? (step.sorted[i] > 0 ? 'to technique 1' : 'forced') : '')} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Gains are technique1 minus technique2. The first k tasks in gain order must use technique 1, and any later gain is taken only if it is positive.</p>
  </>} />
}
