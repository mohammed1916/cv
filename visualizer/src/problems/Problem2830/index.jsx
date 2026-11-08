import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty set of houses earns nothing.' },
    { id: 'house', label: 'Skip house', description: 'Carry the best total forward past this house.' },
    { id: 'offer', label: 'Offer', description: 'Try an offer that ends at this house.' },
    { id: 'done', label: 'Complete', description: 'Report the best total for all houses.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n (houses) and offers ([start, end, gold] triples)',
  url: 'https://leetcode.com/problems/maximize-the-profit-as-the-salesman/',
  complexity: 'O(n + m) time after grouping offers by end house, and O(n) space. The visualization caps input at 12 houses and 8 offers.',
  examples: [
    { label: 'Own case 1', input: '{"n":6,"offers":[[1,1,2],[1,3,3],[2,4,3]]}' },
    { label: 'Big offer', input: '{"n":5,"offers":[[0,0,1],[0,2,10],[1,3,2]]}' },
    { label: "Single house, no offers", input: "{\"n\":1,\"offers\":[]}" },
    { label: "Single house with offer", input: "{\"n\":1,\"offers\":[[0,0,3]]}" },
    { label: "Equal gold offers", input: "{\"n\":3,\"offers\":[[0,1,4],[1,2,4],[0,2,4]]}" },
    { label: "Long run: 12 houses, 8 seeded offers", input: "{\"n\":12,\"offers\":[[11,11,8],[6,7,7],[1,11,10],[8,9,9],[11,11,6],[6,9,5],[1,7,10],[0,5,3]]}" },
  ],
}

export default function SalesmanProfit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="best[h]: gold from the first h houses" values={[step.best]} rowLabels={['best']}
      activeCell={step.house === -1 ? null : { row: 0, column: step.house + 1 }} />
    <output aria-label="Status">{step.message}</output>
    {step.offer && <p aria-label="Offer">{`Offer houses ${step.offer[0]} to ${step.offer[1]} for ${step.offer[2]} gold (n = ${run.input.n})`}</p>}
  </>} renderReasoning={() => <>
    <p>Each house is either skipped or is the last house of one offer. The best total up to a house is the better of skipping it and taking an offer that ends there, plus the best total before that offer starts.</p>
  </>} />
}
