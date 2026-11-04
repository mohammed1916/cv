import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MeltView from './MeltView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const row = (product, a, b, c, d) => ({ product, quarter_1: a, quarter_2: b, quarter_3: c, quarter_4: d })
const definition = {
  number: '2890',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with report (rows with product and quarter_1 to quarter_4)',
  url: 'https://leetcode.com/problems/reshape-data-melt/',
  complexity: 'O(r) time and space for r rows, since each row yields exactly four long rows. The visualization caps report at 8 rows.',
  examples: [
    { label: 'Three products', input: JSON.stringify({ report: [row('Kite', 12, 40, 75, 9), row('Lantern', 310, 0, 58, 144), row('Compass', 66, 91, 23, 180)] }) },
    { label: 'One product', input: JSON.stringify({ report: [row('Hammock', 7, 7, 52, 3)] }) },
    { label: 'Empty table', input: JSON.stringify({ report: [] }) },
  ],
}

export default function ReshapeDataMelt() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MeltView run={run} step={step} />} renderReasoning={() => <>
    <p>In the wide table a quarter is stored in a column name, not in a value. Melting moves that name into the data: every sales cell becomes a row that spells out the product, the quarter and the number.</p>
    <p>The product column stays as an identifier and repeats once per quarter. Walking column by column gives the order pandas produces, so all quarter_1 rows come first.</p>
    <p>In practice this whole loop is one call: <code>pd.melt(report, id_vars=['product'], var_name='quarter', value_name='sales')</code>. The loop is written out here so each cell can be followed.</p>
  </>} />
}
