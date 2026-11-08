import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import CircleFlowView from './CircleFlowView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with balance (integers around the circle)',
  url: 'https://leetcode.com/problems/minimum-moves-to-balance-circular-array-ii/',
  complexity: 'Each round saturates a supply, a need or an undone edge, so rounds stay near O(n), and each search is at worst O(n^2). That is O(n^3) at worst for the official limit of 1000 people; the visualization shows up to 12.',
  examples: [
    { label: 'Two sources', input: '{"balance":[6,-2,-3,1,-1,-1]}' },
    { label: 'A later unit reroutes', input: '{"balance":[3,-2,0,0,2,-3]}' },
    { label: 'Impossible', input: '{"balance":[2,-4,1]}' },
    { label: 'Nothing to do', input: '{"balance":[0,5,0]}' },
    { label: "Single balanced entry", input: '{"balance":[0]}' },
    { label: "Equal and opposite pair", input: '{"balance":[3,-3]}' },
    { label: "Largest balances", input: '{"balance":[100000,-100000,100000,-100000,100000,-100000,100000,-100000,100000,-100000,100000,-100000]}' },
    { label: "Long run: 12 entries", input: '{"balance":[576,-87,-217,763,830,-88,-568,833,-194,211,28,-2087]}' },
  ],
}

const COLUMNS = ['round', 'from', 'to', 'units', 'price each', 'moves added', 'moves total']

export default function MinimumMovesCircularII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <div style={{ display: 'grid', gap: 14 }}>
    <CircleFlowView step={step} />
    <RecordStateTable label="Shipments so far" columns={COLUMNS} rows={step.rounds} activeRow={step.phase === 'push' ? step.rounds.length - 1 : -1} />
  </div>} renderReasoning={() => <>
    <p>A unit that walks d steps costs d moves, so this is about choosing which spare unit serves which shortage. Only the number of units crossing each edge matters, and the total cost is the sum of those counts.</p>
    <p>Always shipping along the currently cheapest route gives the minimum, as long as an earlier choice can be taken back. Pushing against units already crossing an edge removes a move, so that step costs -1. A later round can therefore shorten an earlier shipment instead of adding to it. Spare units never have to be used up, so only shortages drive the loop.</p>
  </>} />
}
