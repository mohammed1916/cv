import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PointerLedgerView from './PointerLedgerView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1485',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with val, left, right and random arrays (node 0 is the root; -1 means null)',
  url: 'https://leetcode.com/problems/clone-binary-tree-with-random-pointer/description/',
  complexity: 'O(n) time and O(n) space for n nodes, using a map from original to copy. The visualization caps the tree at 10 nodes with values from 0 to 9; the draft does not verify the official bounds.',
  examples: [
    { label: 'Random pointers', input: '{"val":[1,2,3],"left":[1,-1,-1],"right":[2,-1,-1],"random":[2,0,-1]}' },
    { label: 'Self pointer', input: '{"val":[7],"left":[-1],"right":[-1],"random":[0]}' },
    { label: 'Deeper chain', input: '{"val":[4,5,6,7],"left":[1,2,-1,-1],"right":[-1,-1,3,-1],"random":[3,0,1,2]}' },
  ],
}

export default function Problem1485Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PointerLedgerView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
