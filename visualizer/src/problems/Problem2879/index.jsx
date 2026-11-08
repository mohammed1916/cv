import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Table', description: 'Look at the whole table.' },
    { id: 'step', label: 'Take row', description: 'Keep one of the first three rows.' },
    { id: 'done', label: 'Head', description: 'The first rows are returned.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rows (list of row objects)',
  url: 'https://leetcode.com/problems/display-the-first-three-rows/',
  complexity: 'O(1) for three rows; the cost does not grow with the table.',
  examples: [
    { label: 'Five rows', input: '{"rows":[{"id":1},{"id":2},{"id":3},{"id":4},{"id":5}]}' },
    { label: 'Two rows', input: '{"rows":[{"id":"a"},{"id":"b"}]}' },
    { label: "One row", input: "{\"rows\":[{\"id\":1}]}" },
    { label: "Exactly three rows", input: "{\"rows\":[{\"id\":1,\"name\":\"a\"},{\"id\":2,\"name\":\"b\"},{\"id\":3,\"name\":\"c\"}]}" },
    { label: "Four rows with text ids", input: "{\"rows\":[{\"id\":\"x\"},{\"id\":\"y\"},{\"id\":\"z\"},{\"id\":\"w\"}]}" },
    { label: "Long run: 25 rows", input: "{\"rows\":[{\"id\":1,\"score\":35},{\"id\":2,\"score\":41},{\"id\":3,\"score\":9},{\"id\":4,\"score\":24},{\"id\":5,\"score\":14},{\"id\":6,\"score\":28},{\"id\":7,\"score\":30},{\"id\":8,\"score\":24},{\"id\":9,\"score\":9},{\"id\":10,\"score\":98},{\"id\":11,\"score\":7},{\"id\":12,\"score\":31},{\"id\":13,\"score\":100},{\"id\":14,\"score\":16},{\"id\":15,\"score\":36},{\"id\":16,\"score\":40},{\"id\":17,\"score\":64},{\"id\":18,\"score\":7},{\"id\":19,\"score\":0},{\"id\":20,\"score\":69},{\"id\":21,\"score\":16},{\"id\":22,\"score\":93},{\"id\":23,\"score\":0},{\"id\":24,\"score\":70},{\"id\":25,\"score\":0}]}" },
  ],
}

export default function DisplayFirstThreeRows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Table rows (first three kept)" length={Math.max(step.out.length, 1)} valueAt={i => step.out[i] ?? ''} active={step.at}
      roleAt={i => (i < step.out.length ? 'kept' : 'dropped')} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A prefix is the first few items in the order they already have. Nothing is reordered or recomputed.</p>
  </>} />
}
