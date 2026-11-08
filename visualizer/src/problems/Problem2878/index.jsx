import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Rows', description: 'Count the rows.' },
    { id: 'step', label: 'Columns', description: 'Count the columns.' },
    { id: 'done', label: 'Size', description: 'Return the pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with columns and data (rows)',
  url: 'https://leetcode.com/problems/get-the-size-of-a-dataframe/',
  complexity: 'O(1) once the table is known; counting its rows and columns is direct.',
  examples: [
    { label: 'Three by two', input: '{"columns":["id","name"],"data":[[1,"a"],[2,"b"],[3,"c"]]}' },
    { label: "One column, one row", input: "{\"columns\":[\"id\"],\"data\":[[1]]}" },
    { label: "No rows", input: "{\"columns\":[\"a\",\"b\"],\"data\":[]}" },
    { label: "Six columns, three rows", input: "{\"columns\":[\"id\",\"name\",\"city\",\"score\",\"rank\",\"note\"],\"data\":[[1,\"a\",\"x\",2,3,\"y\"],[2,\"b\",\"y\",4,1,\"z\"],[3,\"c\",\"z\",6,2,\"w\"]]}" },
    { label: "Long run: 10 rows, 4 columns", input: "{\"columns\":[\"a\",\"b\",\"c\",\"d\"],\"data\":[[35,32,40,20],[47,53,86,32],[58,91,61,62],[2,21,13,93],[48,5,70,79],[47,36,33,62],[88,79,84,25],[21,75,46,46],[78,57,63,29],[82,89,70,24]]}" },
  ],
}

export default function GetSizeOfDataFrame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Size as [rows, columns]" length={step.out.length} valueAt={i => step.out[i]} active={step.at}
      roleAt={i => (i === 0 ? 'rows' : 'columns')} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The shape is a pair: the first number counts rows, the second counts columns.</p>
  </>} />
}
