import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every price starts at full value.' },
    { id: 'apply', label: 'Apply', description: 'Pair the next largest price with the next largest discount.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Prices and discounts (JSON object with prices and discounts)',
  url: 'https://www.talentd.in/fleetcode/problems/minimum-total-price-after-applying-discounts',
  complexity: 'O(n log n + m log m) time for the sorts and O(1) extra space. The visualization caps each list at 8 entries.',
  examples: [
    { label: 'Example 1', input: '{"prices":[10,30,21],"discounts":[50,60]}' },
    { label: 'Example 2', input: '{"prices":[100,70],"discounts":[10,40,50]}' },
  ],
}

export default function MinimumTotalPriceDiscounts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <table aria-label="Pairings">
    <thead><tr><th>Price</th><th>Discount</th></tr></thead>
    <tbody>{run.input.prices.slice().sort((x, y) => y - x).map((price, i) => {
      const discount = run.input.discounts.slice().sort((x, y) => y - x)[i]
      const applied = step.index >= i && discount !== undefined
      return <tr key={i} data-applied={applied ? 'true' : undefined}>
        <td>{price}</td><td>{discount === undefined ? 'none' : `${discount}%`}</td>
      </tr>
    })}</tbody>
    <caption>{`Running total in hundredths: ${step.total}`}</caption>
  </table>} renderReasoning={() => <>
    <p>A saving equals price times discount divided by 100, so the largest products come from pairing the largest prices with the largest discounts.</p>
    <p>Each item takes at most one discount and each discount is used at most once.</p>
  </>} />
}
