import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ListMergeView from './ListMergeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2181',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'List values as JSON, starting and ending with 0, e.g. [0,3,1,0,4,5,2,0]',
  url: 'https://leetcode.com/problems/merge-nodes-in-between-zeros/',
  complexity: 'O(n) time and O(n) space for the merged list. The visualization caps the list at 14 values, each from 0 to 9.',
  examples: [
    { label: 'Two runs', input: '[0,3,1,0,4,5,2,0]' },
    { label: 'Three runs', input: '[0,1,0,3,0,2,2,0]' },
    { label: 'Single value run', input: '[0,7,0]' },
  ],
}

export default function Problem2181Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ListMergeView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
