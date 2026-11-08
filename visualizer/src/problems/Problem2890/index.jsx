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
    { label: "All zero sales", input: "{\"report\":[{\"product\":\"Pen\",\"quarter_1\":0,\"quarter_2\":0,\"quarter_3\":0,\"quarter_4\":0}]}" },
    { label: "Equal totals for two products", input: "{\"report\":[{\"product\":\"Cup\",\"quarter_1\":5,\"quarter_2\":5,\"quarter_3\":5,\"quarter_4\":5},{\"product\":\"Mug\",\"quarter_1\":5,\"quarter_2\":5,\"quarter_3\":5,\"quarter_4\":5}]}" },
    { label: "Maximum rows, large values", input: "{\"report\":[{\"product\":\"Item0\",\"quarter_1\":999999999,\"quarter_2\":0,\"quarter_3\":0,\"quarter_4\":1},{\"product\":\"Item1\",\"quarter_1\":999999999,\"quarter_2\":1,\"quarter_3\":0,\"quarter_4\":1},{\"product\":\"Item2\",\"quarter_1\":999999999,\"quarter_2\":2,\"quarter_3\":0,\"quarter_4\":1},{\"product\":\"Item3\",\"quarter_1\":999999999,\"quarter_2\":3,\"quarter_3\":0,\"quarter_4\":1},{\"product\":\"Item4\",\"quarter_1\":999999999,\"quarter_2\":4,\"quarter_3\":0,\"quarter_4\":1},{\"product\":\"Item5\",\"quarter_1\":999999999,\"quarter_2\":5,\"quarter_3\":0,\"quarter_4\":1},{\"product\":\"Item6\",\"quarter_1\":999999999,\"quarter_2\":6,\"quarter_3\":0,\"quarter_4\":1},{\"product\":\"Item7\",\"quarter_1\":999999999,\"quarter_2\":7,\"quarter_3\":0,\"quarter_4\":1}]}" },
    { label: "Long run: 8 products", input: "{\"report\":[{\"product\":\"Prod0\",\"quarter_1\":178,\"quarter_2\":206,\"quarter_3\":313,\"quarter_4\":323},{\"product\":\"Prod1\",\"quarter_1\":236,\"quarter_2\":253,\"quarter_3\":20,\"quarter_4\":161},{\"product\":\"Prod2\",\"quarter_1\":347,\"quarter_2\":304,\"quarter_3\":31,\"quarter_4\":423},{\"product\":\"Prod3\",\"quarter_1\":372,\"quarter_2\":319,\"quarter_3\":436,\"quarter_4\":265},{\"product\":\"Prod4\",\"quarter_1\":162,\"quarter_2\":120,\"quarter_3\":146,\"quarter_4\":220},{\"product\":\"Prod5\",\"quarter_1\":383,\"quarter_2\":58,\"quarter_3\":186,\"quarter_4\":244},{\"product\":\"Prod6\",\"quarter_1\":146,\"quarter_2\":49,\"quarter_3\":19,\"quarter_4\":230},{\"product\":\"Prod7\",\"quarter_1\":465,\"quarter_2\":83,\"quarter_3\":259,\"quarter_4\":163}]}" },
  ],
}

export default function ReshapeDataMelt() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MeltView run={run} step={step} />} renderReasoning={() => <>
    <p>In the wide table a quarter is stored in a column name, not in a value. Melting moves that name into the data: every sales cell becomes a row that spells out the product, the quarter and the number.</p>
    <p>The product column stays as an identifier and repeats once per quarter. Walking column by column gives the order pandas produces, so all quarter_1 rows come first.</p>
    <p>In practice this whole loop is one call: <code>pd.melt(report, id_vars=['product'], var_name='quarter', value_name='sales')</code>. The loop is written out here so each cell can be followed.</p>
  </>} />
}
