import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MissingQuantityTable from './MissingQuantityTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with products (each row has name, quantity and price; null means missing)',
  url: 'https://leetcode.com/problems/fill-missing-data/',
  complexity: 'O(n) time for n rows, O(n) for the mask. The visualization shows up to 12 rows; the method itself has no such limit.',
  examples: [
    { label: 'Some missing', input: '{"products":[{"name":"Kettle","quantity":null,"price":42},{"name":"Lantern","quantity":7,"price":18},{"name":"Tent","quantity":null,"price":260},{"name":"Compass","quantity":0,"price":25}]}' },
    { label: 'Nothing missing', input: '{"products":[{"name":"Rope","quantity":3,"price":12},{"name":"Stove","quantity":0,"price":95}]}' },
    { label: 'All missing', input: '{"products":[{"name":"Flask","quantity":null,"price":14},{"name":"Map","quantity":null,"price":6}]}' },
  ],
}

export default function FillMissingData() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MissingQuantityTable run={run} step={step} />} renderReasoning={() => <>
    <p>Missing is a state of a cell, not a value, so it has to be asked about separately. A quantity of 0 is a real count and the mask leaves it alone.</p>
    <p>The mask is a column of True and False, and assigning through it changes only the selected rows of the one named column. pandas also offers <code>fillna(0)</code> on the column, which does the same two steps in one call.</p>
  </>} />
}
