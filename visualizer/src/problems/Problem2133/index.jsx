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
