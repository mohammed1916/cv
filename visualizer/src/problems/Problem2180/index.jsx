import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import NumberGridView from './NumberGridView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2180',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'A positive integer, e.g. 30',
  url: 'https://leetcode.com/problems/count-integers-with-even-digit-sum/',
  complexity: 'O(num log num) time for the digit sums. The visualization caps num at 80.',
  examples: [
    { label: 'Two digit range', input: '30' },
    { label: 'Small', input: '4' },
    { label: 'Just past nine', input: '10' },
  ],
}

export default function Problem2180Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <NumberGridView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
