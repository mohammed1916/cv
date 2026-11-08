import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'Splitting nothing costs 0.' },
    { id: 'piece', label: 'Last piece', description: 'Price the last piece as k plus its repeated values, then add the best cost before it.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/minimum-cost-to-split-an-array/',
  complexity: 'O(n^3) time for the direct pricing of each piece, O(n) space. The visualization caps n at 10.',
  examples: [
    { label: 'Eight digits, k four', input: '{"nums":[6,1,8,8,2,6,3,6],"k":4}' },
    { label: 'Example 2', input: '{"nums":[1,1],"k":1}' },
    { label: 'Single zero', input: '{"nums":[0],"k":1}' },
    { label: 'Equal values', input: '{"nums":[3,3,3,3],"k":2}' },
    { label: 'Largest values for ten picks', input: '{"nums":[9,9,9,9,9,9,9,9,9,9],"k":10}' },
    { label: 'Long run: ten digits, ten picks', input: '{"nums":[0,1,4,0,7,8,1,8,3,0],"k":10}' },
  ],
}

export default function MinimumCostToSplit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Best total for each prefix (unset = Infinity)" length={step.dp.length} valueAt={i => (Number.isFinite(step.dp[i]) ? step.dp[i] : '-')}
      active={step.end} roleAt={i => (step.start >= 0 && i === step.start ? 'start' : '')} />
    <output aria-label="Piece">{step.cost === null ? `Values ${run.input.nums.join(', ')}` : `Piece ${step.start}..${step.end - 1} costs ${step.cost}`}</output>
  </>} renderReasoning={() => <>
    <p>A piece costs k plus the values in it that appear more than once, since values that appear once are trimmed.</p>
    <p>The best total for a prefix is the cheapest over every last piece, so one table over prefix length gives the answer.</p>
  </>} />
}
