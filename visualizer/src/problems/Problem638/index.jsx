import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Needs', description: 'Start from the full shopping list.' },
    { id: 'price', label: 'List price', description: 'Price the remaining needs without offers.' },
    { id: 'offer', label: 'Try offer', description: 'Apply an offer that fits and recurse.' },
    { id: 'done', label: 'Complete', description: 'Return the minimum price.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Shopping problem (JSON object with price, special and needs)',
  url: 'https://leetcode.com/problems/shopping-offers/',
  complexity: 'O(S · Π(needs+1)) time with memoization over reachable need-vectors, where S is the number of offers.',
  examples: [
    { label: 'Bundle wins', input: '{"price":[2,5],"special":[[3,0,5],[1,2,10]],"needs":[3,2]}' },
    { label: 'Mix', input: '{"price":[2,3,4],"special":[[1,1,0,4],[2,2,1,9]],"needs":[1,2,1]}' },
    { label: 'No offers', input: '{"price":[1],"special":[],"needs":[4]}' },
  ],
}

export default function ShoppingOffers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Needs">
      <thead><tr>{run.input.price.map((_, i) => <th key={i}>item {i} (${run.input.price[i]})</th>)}</tr></thead>
      <tbody><tr>{step.needs.map((q, i) => <td key={i} style={{ textAlign: 'center', fontWeight: 700 }}>{q}</td>)}</tr></tbody>
    </table>
    <StackLane title="Offers in the current branch" items={step.path.length ? step.path : []} note={step.path.length ? `depth ${step.path.length}` : 'list price only'} />
    <output aria-label="Best price">Best for these needs: {step.best ?? '—'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Memoization:</strong> the best price depends only on the remaining needs, so each need-vector is solved once.</p>
  </>} />
}
