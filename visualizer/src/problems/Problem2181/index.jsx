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
    { label: 'Single run', input: '[0,5,0]' },
    { label: 'Equal runs', input: '[0,2,0,2,0]' },
    { label: 'Largest list, one long run', input: '[0,9,9,9,9,9,9,9,9,9,9,9,9,0]' },
    { label: 'Long run: 14 nodes', input: '[0,9,5,0,7,0,9,2,6,0,9,8,9,0]' },
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
