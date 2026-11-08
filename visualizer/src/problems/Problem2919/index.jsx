import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases: [
    { id: 'short', label: 'Short array', description: 'Arrays shorter than 3 need no work.' },
    { id: 'cover', label: 'Cover index', description: 'Compute the cheapest way to cover windows ending here.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum over the last three positions.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'JSON object with nums (1 to 20 values from 0 to 20) and k (1 to 20)',
  url: 'https://leetcode.doocs.org/en/lc/2919/',
  complexity: 'O(n) time and O(n) space for the DP table.',
  examples: [
    { label: 'Spread raises', input: '{"nums": [1,4,0,2,1], "k": 3}' },
    { label: 'All small', input: '{"nums": [0,0,0,0,0], "k": 2}' },
    { label: 'Single value', input: '{"nums":[0],"k":1}' },
    { label: 'Equal values', input: '{"nums":[3,3,3],"k":3}' },
    { label: 'Upper limits', input: '{"nums":[20,20,20,20],"k":20}' },
    { label: 'Long run: 20 values', input: '{"nums":[20,9,9,1,9,2,2,20,9,6,1,12,5,19,13,9,5,19,14,11],"k":5}' },
  ],
}

export default function IncrementBeautiful() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="nums" length={run.nums.length} valueAt={i => run.nums[i]} active={step.index} />
      <output aria-label="Best totals">{step.dp.length ? `Best totals so far: ${step.dp.join(', ')}` : 'No windows to cover.'}</output>
    </>
  )} renderReasoning={() => <>
    <p>Every three consecutive positions must contain one raised value that reaches k.</p>
    <p>Choosing raised positions with gaps of at most two gives a DP over the last raised position.</p>
  </>} />
}
