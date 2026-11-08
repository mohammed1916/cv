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
    { label: "One product, quantity missing", input: "{\"products\":[{\"name\":\"Flask\",\"quantity\":null,\"price\":9}]}" },
    { label: "Equal prices, one missing", input: "{\"products\":[{\"name\":\"Pen\",\"quantity\":4,\"price\":3},{\"name\":\"Cup\",\"quantity\":null,\"price\":3}]}" },
    { label: "Maximum rows, every other missing", input: "{\"products\":[{\"name\":\"P0\",\"quantity\":0,\"price\":10},{\"name\":\"P1\",\"quantity\":null,\"price\":11},{\"name\":\"P2\",\"quantity\":2,\"price\":12},{\"name\":\"P3\",\"quantity\":null,\"price\":13},{\"name\":\"P4\",\"quantity\":4,\"price\":14},{\"name\":\"P5\",\"quantity\":null,\"price\":15},{\"name\":\"P6\",\"quantity\":6,\"price\":16},{\"name\":\"P7\",\"quantity\":null,\"price\":17},{\"name\":\"P8\",\"quantity\":8,\"price\":18},{\"name\":\"P9\",\"quantity\":null,\"price\":19},{\"name\":\"P10\",\"quantity\":10,\"price\":20},{\"name\":\"P11\",\"quantity\":null,\"price\":21}]}" },
    { label: "Long run: 12 products", input: "{\"products\":[{\"name\":\"Item0\",\"quantity\":7,\"price\":172},{\"name\":\"Item1\",\"quantity\":24,\"price\":79},{\"name\":\"Item2\",\"quantity\":29,\"price\":51},{\"name\":\"Item3\",\"quantity\":35,\"price\":238},{\"name\":\"Item4\",\"quantity\":39,\"price\":56},{\"name\":\"Item5\",\"quantity\":null,\"price\":260},{\"name\":\"Item6\",\"quantity\":null,\"price\":119},{\"name\":\"Item7\",\"quantity\":35,\"price\":129},{\"name\":\"Item8\",\"quantity\":13,\"price\":282},{\"name\":\"Item9\",\"quantity\":12,\"price\":48},{\"name\":\"Item10\",\"quantity\":16,\"price\":227},{\"name\":\"Item11\",\"quantity\":23,\"price\":10}]}" },
  ],
}

export default function FillMissingData() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MissingQuantityTable run={run} step={step} />} renderReasoning={() => <>
    <p>Missing is a state of a cell, not a value, so it has to be asked about separately. A quantity of 0 is a real count and the mask leaves it alone.</p>
    <p>The mask is a column of True and False, and assigning through it changes only the selected rows of the one named column. pandas also offers <code>fillna(0)</code> on the column, which does the same two steps in one call.</p>
  </>} />
}
