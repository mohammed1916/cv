import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LevelStripView from './LevelStripView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1602',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with tree (LeetCode level-order array, null for missing children) and u (the array position of the node)',
  url: 'https://leetcode.com/problems/find-nearest-right-node-in-binary-tree/description/',
  complexity: 'O(n) time and O(w) space for n nodes and the widest level w. The visualization caps the tree at 15 positions with values from 0 to 9; the draft does not verify the official bounds. The node is named by its array position.',
  examples: [
    { label: 'Right neighbour', input: '{"tree":[1,2,3,null,4,5,6],"u":4}' },
    { label: 'Rightmost on level', input: '{"tree":[1,2,3,null,4,5,6],"u":2}' },
    { label: 'Root', input: '{"tree":[7],"u":0}' },
  ],
}

export default function Problem1602Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LevelStripView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
