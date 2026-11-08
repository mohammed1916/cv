import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PointerLedgerView from './PointerLedgerView'
import CloneTreeView from './CloneTreeView'
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
  complexity: 'O(n) time and O(n) space for n nodes, using a map from original to copy. The visualization caps the tree at 10 nodes with values from 0 to 9;',
  examples: [
    { label: 'Random pointers', input: '{"val":[3,5,9],"left":[1,-1,-1],"right":[2,-1,-1],"random":[2,0,-1]}' },
    { label: 'Self pointer', input: '{"val":[7],"left":[-1],"right":[-1],"random":[0]}' },
    { label: 'Deeper chain', input: '{"val":[4,5,6,7],"left":[1,2,-1,-1],"right":[-1,-1,3,-1],"random":[3,0,1,2]}' },
    { label: 'Single node, null random', input: '{"val":[2],"left":[-1],"right":[-1],"random":[-1]}' },
    { label: 'Repeated values', input: '{"val":[4,4,4],"left":[1,-1,-1],"right":[2,-1,-1],"random":[-1,-1,0]}' },
    { label: 'Value limits chain', input: '{"val":[9,0,9,0],"left":[1,-1,3,-1],"right":[2,-1,-1,-1],"random":[3,-1,0,2]}' },
    { label: 'Long run: 10 nodes', input: '{"val":[0,2,0,0,4,6,7,0,4,1],"left":[1,3,5,7,9,-1,-1,-1,-1,-1],"right":[2,4,6,8,-1,-1,-1,-1,-1,-1],"random":[9,0,5,1,9,8,7,6,3,3]}' },
  ],
}

export default function Problem1485Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <><CloneTreeView run={run} step={step} /><PointerLedgerView run={run} step={step} /></>}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
