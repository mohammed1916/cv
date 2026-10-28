import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'The empty prefix has cost 0.' },
    { id: 'piece', label: 'Try a piece', description: 'Make nums[start..end) the last piece and compare its total.' },
    { id: 'done', label: 'Complete', description: 'Report the best total for the whole array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from -10 to 10 (JSON array, up to 10 entries)',
  url: 'https://leetcode.com/problems/maximize-total-cost-of-alternating-subarrays/',
  complexity: 'O(n^3) time in this direct form and O(n) space for the table. The visualization caps input at 10 entries.',
  examples: [
    { label: 'Increasing', input: '[1,2,3,4]' },
    { label: 'Alternating', input: '[1,-1,1,-1]' },
  ],
}

export default function AlternatingCost() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="best[e]: maximum cost of the first e numbers" values={[step.best]} rowLabels={['best']}
      activeCell={step.end > 0 ? { row: 0, column: step.end } : null} />
    <p aria-label="Input">{`nums: ${run.input.join(', ')}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A piece nums[s..e) costs the alternating sum nums[s] - nums[s+1] + nums[s+2] - ..., starting with plus at its first element.</p>
    <p>The best total for the first e numbers is the best over every start s of the best total for the first s numbers plus that piece’s cost.</p>
  </>} />
}
