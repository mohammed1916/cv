import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { phases, sql, code, python, parseInput, buildTrace } from './algorithm'

const STORE_COLUMNS = ['north', 'south', 'west']

const inputLabel = 'Object with rows: [product_id, store, price] triples'
const complexity = 'O(n log n) time to sort the product ids, then three fixed column checks per product. The teaching version caps rows at 12.'
const examples = [
  { label: 'Three products', input: '{"rows":[[101,"north",40],[101,"west",55],[102,"south",18],[103,"north",7],[103,"south",9]]}' },
  { label: 'One price', input: '{"rows":[[7,"west",3]]}' },
]

function renderVisual({ run, step }) {
  return <>
    <h3>{meta.title}</h3>
    <table aria-label="Products input">
      <thead><tr><th>product_id</th><th>store</th><th>price</th></tr></thead>
      <tbody>{run.input.rows.map(([id, store, price]) => <tr key={`${id}-${store}`}>
        <td>{id}</td><td>{store}</td><td>{price}</td></tr>)}</tbody>
    </table>
    <table aria-label="Pivot output so far">
      <thead><tr><th>product_id</th>{STORE_COLUMNS.map(store => <th key={store}>{store}</th>)}</tr></thead>
      <tbody>{step.snapshot.map(row => <tr key={row.product_id}>
        <td>{row.product_id}</td>
        {STORE_COLUMNS.map(store => <td key={store}>{row[store] === null ? 'NULL' : row[store]}</td>)}
      </tr>)}</tbody>
    </table>
    <output aria-label="Pivot state">{step.productId === null ? 'Columns fixed' : `Product ${step.productId}${step.store ? `, ${step.store}` : ''}`}</output>
  </>
}

function renderReasoning() {
  return <>
    <p>The store names are fixed in the query, so each output column is one MAX over a CASE expression. The CASE keeps the price only for its own store, and MAX returns that single price or NULL.</p>
    <p>Grouping by product_id gives one output row per product. A dynamic pivot would build these columns at run time from the distinct stores; this teaching version keeps the columns fixed so it runs as plain SQL.</p>
  </>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel, complexity, examples,
}

export default function DynamicPivotingOfATable() {
  return <AlgorithmWorkspace definition={definition} renderVisual={renderVisual} renderReasoning={renderReasoning} />
}
