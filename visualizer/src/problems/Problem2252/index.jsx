import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import StageStrip from './StageStrip'
import { phases, sql, code, python, parseInput, buildTrace } from './algorithm'

const inputLabel = 'Object with rows: [product_id, store, price] triples; store names are lowercase letters'
const complexity = 'O(n log n + p * s) time for n rows, p products and s store columns, after sorting the products and stores. The teaching version caps rows at 12.'
const examples = [
  { label: 'Three products', input: '{"rows":[[101,"north",40],[101,"west",55],[102,"south",18],[103,"north",7],[103,"south",9]]}' },
  { label: 'One price', input: '{"rows":[[7,"west",3]]}' },
    { label: 'Equal prices, two stores', input: '{"rows":[[5,"east",8],[5,"west",8]]}' },
    { label: 'Zero price and underscore store', input: '{"rows":[[9,"solo_shop",0]]}' },
    { label: 'Largest ids and prices', input: '{"rows":[[999,"a",1000],[999,"zeta",0],[1,"a",1000]]}' },
    { label: 'Long run: 12 rows', input: '{"rows":[[611,"north",974],[717,"harbor",471],[593,"east",231],[556,"central",547],[260,"south",56],[102,"east",386],[777,"harbor",151],[210,"north",158],[164,"harbor",387],[893,"east",401],[219,"central",329],[599,"east",915]]}' },
]

function renderVisual({ run, step }) {
  const STORE_COLUMNS = run.result.length ? Object.keys(run.result[0]).filter(key => key !== 'product_id') : []
  return <>
    <StageStrip phases={phases} step={step} />
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
    <p>Each store in the table becomes a column, sorted by name. A product's price for a store is kept only in that store's column, and a missing price shows as NULL.</p>
    <p>Grouping by product_id gives one output row per product. Plain SQL needs the store list written into the query, so the SQL shown uses the sample's three stores; a dynamic pivot builds the same list at run time.</p>
  </>
}

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel, complexity, examples,
}

export default function DynamicPivotingOfATable() {
  return <AlgorithmWorkspace definition={definition} renderVisual={renderVisual} renderReasoning={renderReasoning} />
}
