import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const ITEM_NAMES = ['A', 'B', 'C', 'D', 'E', 'F']

const definition = {
  phases: [
    { id: 'start', label: 'Remaining needs', description: 'Start from the full shopping list.' },
    { id: 'price', label: 'List price', description: 'Price the remaining items one by one as the baseline.' },
    { id: 'offer', label: 'Try an offer', description: 'An offer is usable only if it does not buy more than needed.' },
    { id: 'done', label: 'Answer', description: 'The cheapest total for the original list.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Shop (JSON with price, special and needs)',
  url: 'https://leetcode.com/problems/shopping-offers/',
  complexity: 'Exponential in the worst case, but each distinct remaining-needs vector is solved once thanks to the memo.',
  examples: [
    { label: 'One bundle', input: '{"price":[3,4],"special":[[2,1,6]],"needs":[2,2]}' },
    { label: 'Overbuy trap', input: '{"price":[5,2],"special":[[1,1,4]],"needs":[1,3]}' },
    { label: 'No offers', input: '{"price":[1,9],"special":[],"needs":[4,1]}' },
  ],
}

export default function ShoppingOffers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const names = run.input.price.map((_, i) => ITEM_NAMES[i])
    const fits = offer => offer.slice(0, -1).every((c, i) => c <= step.needs[i])
    return <>
      <RecordStateTable label="Remaining needs" columns={['item', 'need', 'list price']}
        rows={names.map((item, i) => ({ item, need: step.needs[i], 'list price': run.input.price[i] }))} />
      <RecordStateTable label="Offers" columns={['offer', 'bundle price', 'usable now']}
        rows={run.input.special.map(offer => ({
          offer: offer.slice(0, -1).map((c, i) => (c ? `${c}${names[i]}` : '')).filter(Boolean).join(' + '),
          'bundle price': offer[offer.length - 1],
          'usable now': fits(offer) ? 'yes' : 'no',
        }))}
        activeRow={step.offer ? run.input.special.indexOf(step.offer) : -1} />
      <output aria-label="Best so far">{step.best === null ? 'Not computed yet' : `Best for these needs: ${step.best}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the memo:</strong> different offer orders reach the same remaining needs, so each vector is solved once and reused.</p>
  </>} />
}
