import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql } from './algorithm'
import { meta } from './meta'
import SqlStageBoard from './SqlStageBoard'

const stagesFor = run => {
  const brandOf = new Map(run.input.items.map(r => [r.item_id, r.item_brand]))
  const joined = run.input.orders.map(o => ({ order_id: o.order_id, seller_id: o.seller_id, item_brand: brandOf.get(o.item_id) }))
  const bySeller = new Map()
  for (const row of joined) (bySeller.get(row.seller_id) ?? bySeller.set(row.seller_id, new Set()).get(row.seller_id)).add(row.item_brand)
  const grouped = [...bySeller].sort((a, b) => a[0] - b[0]).map(([seller_id, brands]) => ({ seller_id, distinct_brands: brands.size }))
  const kept = grouped.filter(r => r.distinct_brands >= 2)
  return [
    { id: 'join', clause: 'FROM Orders o JOIN Items i ON i.item_id = o.item_id', label: 'Join', columns: ['order_id', 'seller_id', 'item_brand'], rows: joined },
    { id: 'group', clause: 'GROUP BY o.seller_id', label: 'Group', columns: ['seller_id', 'distinct_brands'], rows: grouped },
    { id: 'having', clause: 'HAVING COUNT(DISTINCT i.item_brand) >= 2', label: 'Keep', columns: ['seller_id', 'distinct_brands'], rows: kept },
  ]
}

const definition = {
  number: meta.number,
  phases: [
    { id: 'items', label: 'Items', description: 'Index each item to its brand.' },
    { id: 'collect', label: 'Join orders', description: 'Attach each order to its item brand and seller.' },
    { id: 'decide', label: 'Decide', description: 'Keep a seller that sold at least two brands.' },
    { id: 'done', label: 'Result', description: 'Report the kept sellers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with items ({item_id, item_brand}) and orders ({order_id, item_id, seller_id})',
  complexity: 'O(n + m) time for n orders and m items, plus a sort of the sellers. The visualization caps the tables at 10 orders and 8 items.',
  examples: [
    { label: 'Two brands', input: '{"items":[{"item_id":1,"item_brand":"Acme"},{"item_id":2,"item_brand":"Bolt"},{"item_id":3,"item_brand":"Acme"},{"item_id":4,"item_brand":"Cora"}],"orders":[{"order_id":10,"item_id":1,"seller_id":7},{"order_id":11,"item_id":3,"seller_id":7},{"order_id":12,"item_id":2,"seller_id":8},{"order_id":13,"item_id":4,"seller_id":8},{"order_id":14,"item_id":2,"seller_id":9}]}' },
    { label: 'Single brand', input: '{"items":[{"item_id":1,"item_brand":"Acme"},{"item_id":2,"item_brand":"Bolt"}],"orders":[{"order_id":20,"item_id":1,"seller_id":5},{"order_id":21,"item_id":2,"seller_id":6}]}' },
  ],
}

export default function Problem2922() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStageBoard title="Query stages" stages={stagesFor(run)} active={run.frames.indexOf(step) === run.frames.length - 1 ? 2 : step.order === null ? 0 : 1} />
    <table aria-label="Seller brand table">
      <thead><tr><th>seller_id</th><th>brands seen</th><th>verdict</th></tr></thead>
      <tbody>
        {step.rows.length === 0 && <tr><td colSpan={3}>No orders joined yet.</td></tr>}
        {step.rows.map(row => <tr key={row.seller_id}>
          <td>{row.seller_id}</td>
          <td>{row.brands.join(', ')}</td>
          <td>{row.qualifies === null ? 'pending' : row.qualifies ? 'kept' : 'dropped'}</td>
        </tr>)}
      </tbody>
    </table>
    <output aria-label="Current order">{step.order === null ? `${run.input.orders.length} orders in the table` : `Order ${step.order}`}</output>
  </>} renderReasoning={() => <>
    <p>Joining each order to its item gives the brand sold on that order. Grouping by seller collects a set of distinct brands per seller.</p>
    <p>A seller is kept when its set has at least two brands. The SQL form is a join, a GROUP BY on the seller and a HAVING test on COUNT(DISTINCT brand).</p>
    <pre>{sql}</pre>
  </>} />
}
