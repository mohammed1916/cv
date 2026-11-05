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
