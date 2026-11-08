import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SheetView from './SheetView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2194',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'A range such as A1:C2',
  url: 'https://leetcode.com/problems/cells-in-a-range-on-an-excel-sheet/',
  complexity: 'O(rows * columns) time for the output, which is the size of the range. The page caps columns at F.',
  examples: [
    { label: 'Block', input: 'A1:C2' },
    { label: 'Single cell', input: 'D4:D4' },
    { label: 'One row', input: 'B3:C3' },
    { label: 'Full width', input: 'A1:F9' },
    { label: 'Tall column', input: 'E2:E9' },
    { label: 'Single corner cell', input: 'F1:F1' },
  ],
}

export default function Problem2194Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SheetView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
