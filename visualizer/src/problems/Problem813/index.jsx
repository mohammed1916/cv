import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'One group', description: 'The best one-group total for each prefix is its average.' },
    { id: 'cell', label: 'Add a group', description: 'Choose where the last group starts.' },
    { id: 'done', label: 'Complete', description: 'Read the best total with exactly k groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums and k (JSON object)',
  url: 'https://leetcode.com/problems/largest-sum-of-averages/',
  complexity: 'O(k * n^2) time and O(k * n) space.',
  examples: [
    { label: 'Three groups', input: '{"nums":[9,1,2,3,9],"k":3}' },
    { label: 'Two groups', input: '{"nums":[4,1,7,2],"k":2}' },
    { label: 'Single element', input: '{"nums":[5],"k":1}' },
    { label: 'Equal values', input: '{"nums":[4,4,4,4],"k":2}' },
    { label: 'Full length with extreme values', input: '{"nums":[100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0],"k":30}' },
    { label: 'Long run: 30 values, k = 10', input: '{"nums":[81,2,14,25,38,37,92,17,98,23,26,40,56,70,39,100,11,42,84,42,65,58,100,23,88,23,84,72,25,2],"k":10}' },
  ],
}

export default function LargestSumOfAverages() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums (the last group ends at the active position)" length={run.input.nums.length} valueAt={k => run.input.nums[k]} active={step.i !== null && step.i > 0 ? step.i - 1 : -1} roleAt={k => (step.cut !== undefined && k === step.cut ? 'cut' : '')} />
    <MatrixGrid label="Best totals: row = number of groups, column = prefix length" matrix={step.table}
      activeCell={step.i !== null ? { row: step.g - 1, col: step.i } : null} />
    <output aria-label="Step">{step.message}</output>
    <p>{`Values: ${run.input.nums.join(', ')}`}</p>
  </>} renderReasoning={() => <>
    <p>A table row counts groups and a column counts prefix length. To add a group, the last cut j is chosen to maximise the previous row at j plus the average of the new group j..i.</p>
    <p>Splitting a group never lowers the sum of averages, so exactly k groups is the answer.</p>
  </>} />
}
