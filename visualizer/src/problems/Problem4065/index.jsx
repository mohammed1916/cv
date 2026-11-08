import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RoundTallyView from './RoundTallyView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '4065',
  phases: [
    { id: 'setup', label: 'Count', description: 'Count the copies of each value.' },
    { id: 'round', label: 'Round', description: 'List the distinct values still present.' },
    { id: 'take', label: 'Take', description: 'Append one copy of each value in order.' },
    { id: 'done', label: 'Result', description: 'Return the concatenated rounds.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of integers from 1 to 100, e.g. [4, 4, 2, 9, 2]',
  url: 'https://leetcode.com/problems/rearrange-array-by-removing-distinct-values/description/',
  complexity: 'O(n log n) time: each round sorts its distinct values and removes at most n copies in total. The visualization caps the array at 24 values.',
  examples: [
    { label: 'Two rounds', input: '[4, 4, 2, 9, 2]' },
    { label: 'Single copies', input: '[7, 3, 5]' },
    { label: "Single value", input: "[1]" },
    { label: "Equal values", input: "[3,3,3,3]" },
    { label: "Largest and smallest values", input: "[100,1,100,1,100]" },
    { label: "Long run: 24 values", input: "[10,66,50,40,74,9,38,91,72,38,2,99,77,89,15,12,52,2,6,28,73,90,46,44]" },
  ],
}

export default function RearrangeByRemovingVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RoundTallyView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer length: ${run.result.length}.` : ''}
        </p>
      )}
    />
  )
}
