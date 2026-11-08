import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2133',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Square matrix as JSON rows',
  url: 'https://leetcode.com/problems/check-if-every-row-and-column-contains-all-numbers/',
  complexity: 'O(n^2) time with a set per row and column; O(n) extra space per line checked.',
  examples: [
    { label: 'Valid Latin square', input: '[[2,1],[1,2]]' },
    { label: 'Repeated in a column', input: '[[1,1],[2,2]]' },
    { label: 'Single cell', input: '[[1]]' },
    { label: 'Repeat in a row', input: '[[2,2],[1,1]]' },
    { label: 'Equal values down one column', input: '[[3,1,2],[3,2,1],[3,3,3]]' },
    { label: 'Largest 9 by 9 square', input: '[[1,2,3,4,5,6,7,8,9],[2,3,4,5,6,7,8,9,1],[3,4,5,6,7,8,9,1,2],[4,5,6,7,8,9,1,2,3],[5,6,7,8,9,1,2,3,4],[6,7,8,9,1,2,3,4,5],[7,8,9,1,2,3,4,5,6],[8,9,1,2,3,4,5,6,7],[9,1,2,3,4,5,6,7,8]]' },
    { label: 'Long run: 9 by 9 square', input: '[[1,6,2,7,3,8,4,9,5],[3,8,4,9,5,1,6,2,7],[5,1,6,2,7,3,8,4,9],[7,3,8,4,9,5,1,6,2],[9,5,1,6,2,7,3,8,4],[2,7,3,8,4,9,5,1,6],[4,9,5,1,6,2,7,3,8],[6,2,7,3,8,4,9,5,1],[8,4,9,5,1,6,2,7,3]]' },
  ],
}

export default function Problem2133Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <RecordStateTable label="Rows and columns: values seen and numbers missing" columns={['line', 'values', 'missing']} rows={step.rows} activeRow={step.rows.length - 2 >= 0 ? step.rows.length - 2 : 0} />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
