import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Nothing connected', description: 'No edge is chosen; the empty mask costs nothing.' },
    { id: 'row', label: 'Add a point', description: 'Each first-group point takes one edge, extending every covered set.' },
    { id: 'done', label: 'Complete', description: 'Pay the cheapest edge for each uncovered second-group point.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Costs (JSON object with cost as a rectangular matrix of costs from 0 to 100)',
  url: 'https://leetcode.com/problems/minimum-cost-to-connect-two-groups-of-points/',
  complexity: 'O(m * 2^n * n) time and O(2^n) space. The visualization caps each group at 4 points.',
  examples: [
    { label: 'Two by two', input: '{"cost":[[15,96],[36,2]]}' },
    { label: 'One by two', input: '{"cost":[[1,9]]}' },
  ],
}

export default function TwoGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.cost[0].length
    return <>
      <DPTable title="dp[i][mask]: cheapest total with i first-group points placed" values={step.table}
        rowLabels={step.table.map((_, i) => i)}
        columnLabels={step.table[0].map((_, mask) => mask.toString(2).padStart(n, '0'))} />
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>The first group is processed one point at a time, and a mask of the second group records which of its points already have an edge.</p>
    <p>Second-group points left uncovered at the end must still be reached, and the cheapest edge into each one is added at the end.</p>
  </>} />
}
