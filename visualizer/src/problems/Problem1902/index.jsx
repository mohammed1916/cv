import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Tree1902View from './Tree1902View'
import './Tree1902View.css'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty tree', description: 'Begin with no nodes.' },
    { id: 'insert', label: 'Next value', description: 'Take the next value in the given order.' },
    { id: 'root', label: 'Root', description: 'The first value becomes the root.' },
    { id: 'compare', label: 'Descend', description: 'Compare the value with the current node.' },
    { id: 'attach', label: 'Attach', description: 'The empty child slot takes the value.' },
    { id: 'done', label: 'Result', description: 'Report the deepest level reached.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON list of distinct integers, in insertion order',
  url: 'https://leetcode.com/problems/depth-of-bst-given-insertion-order/',
  complexity: 'O(n * h) time and O(n) space, where h is the height of the tree built so far; a worst-case chain makes this O(n^2). The visualization caps the list at 15 values from 0 to 99.',
  examples: [
    { label: 'Balanced', input: '[4,2,6,1,3,5,7]' },
    { label: 'Zigzag', input: '[1,3,2]' },
    { label: 'Ascending', input: '[5,4,3,2,1]' },
  ],
}

export default function DepthOfBstVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Tree1902View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
