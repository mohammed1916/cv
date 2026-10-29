import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, examples } from './algorithm'

const definition = {
  phases: [
    { id: 'filter', label: 'Filter', description: 'Keep only restaurants that pass the vegan, price and distance checks.' },
    { id: 'sort', label: 'Sort', description: 'Order kept restaurants by rating, then id, both descending.' },
    { id: 'done', label: 'Result', description: 'Return the ids in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Restaurants (JSON object, e.g. {"restaurants":[[1,4,1,40,10]],"veganFriendly":1,"maxPrice":50,"maxDistance":10})',
  url: 'https://leetcode.com/problems/filter-restaurants-by-vegan-friendly-price-and-distance/',
  complexity: 'O(n log n) time and O(n) space. The visualization caps input at 50 restaurants.',
  examples,
}

export default function FilterRestaurants() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="restaurants" length={run.input.restaurants.length}
        valueAt={i => `#${run.input.restaurants[i][0]} r${run.input.restaurants[i][1]}`} active={step.i}
        roleAt={i => step.statuses[i] ?? ''} />
      <p>Kept so far: {step.kept.length ? step.kept.join(', ') : 'none'}</p>
      {step.order.length > 0 && <p>Order: {step.order.join(', ') || 'none'}</p>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
