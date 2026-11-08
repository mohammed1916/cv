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
    { label: 'Own case 1', input: '{"technique1":[6,3,11],"technique2":[11,4,9],"k":3}' },
    { label: 'Own case 2', input: '{"technique1":[2,3,4],"technique2":[5,6,7],"k":1}' },
    { label: "Single point pair", input: "{\"technique1\":[4],\"technique2\":[9],\"k\":1}" },
    { label: "All points equal", input: "{\"technique1\":[5,5],\"technique2\":[5,5],\"k\":1}" },
    { label: "Largest points, full k", input: "{\"technique1\":[1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1,1,1,1,1,1,1,1,1,1],\"technique2\":[1,1,1,1,1,1,1,1,1,1,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000],\"k\":20}" },
    { label: "Long run: 20 points", input: "{\"technique1\":[573,261,374,618,574,551,434,518,34,20,523,469,621,584,710,5,556,965,133,665],\"technique2\":[674,953,502,382,147,95,540,238,147,739,508,239,751,298,561,916,2,918,487,18],\"k\":10}" },
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
