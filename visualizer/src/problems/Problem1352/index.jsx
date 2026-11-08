import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Start with an empty stream and prefix products of [1].' },
    { id: 'add', label: 'Add', description: 'Append a value, resetting the products at a zero.' },
    { id: 'query', label: 'Product', description: 'Answer the product of the last k values.' },
    { id: 'done', label: 'Complete', description: 'Report every product answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with operations: up to 12 entries of ["add", 0-9] or ["getProduct", k]',
  url: 'https://leetcode.com/problems/product-of-the-last-k-numbers/',
  complexity: 'O(1) per add and O(1) per query. The visualization caps input at 12 operations.',
  examples: [
    { label: 'Example 1', input: '{"operations":[["add",3],["add",0],["add",2],["add",5],["add",4],["getProduct",2],["getProduct",3],["getProduct",4],["add",8],["getProduct",2]]}' },
    { label: 'Single', input: '{"operations":[["add",7],["getProduct",1]]}' },
    { label: "Zero in the product", input: "{\"operations\":[[\"add\",0],[\"getProduct\",1]]}" },
    { label: "Equal values", input: "{\"operations\":[[\"add\",2],[\"add\",2],[\"getProduct\",2]]}" },
    { label: "Eleven nines", input: "{\"operations\":[[\"add\",9],[\"add\",9],[\"add\",9],[\"add\",9],[\"add\",9],[\"add\",9],[\"add\",9],[\"add\",9],[\"add\",9],[\"add\",9],[\"add\",9],[\"getProduct\",11]]}" },
    { label: "Long run: twelve operations", input: "{\"operations\":[[\"add\",4],[\"add\",2],[\"add\",1],[\"add\",7],[\"add\",5],[\"add\",1],[\"add\",9],[\"add\",4],[\"getProduct\",6],[\"getProduct\",4],[\"getProduct\",7],[\"getProduct\",3]]}" },
  ],
}

export default function ProductOfLastKNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="stream" length={step.stream.length} valueAt={index => step.stream[index]} active={step.index}
      roleAt={index => step.stream[index] === 0 ? 'zero' : step.k !== undefined && index >= step.stream.length - step.k ? 'in product' : ''} />
    <output aria-label="Outputs">{`Outputs: ${step.outputs.length ? step.outputs.join(', ') : '(none yet)'}`}</output>
    {run && step.k !== undefined && <output aria-label="Last query">{`Last query k = ${step.k}, answer ${step.answer}`}</output>}
  </>} renderReasoning={() => <>
    <p>Multiplying the last k numbers is a division of two prefix products, once the zero that resets the products is known to be out of range.</p>
    <p>A zero inside the last k numbers makes the whole product 0, so a query that reaches back past the last zero returns 0.</p>
  </>} />
}
