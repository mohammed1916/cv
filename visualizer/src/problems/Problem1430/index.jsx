import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PathMatchView from './PathMatchView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1430',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with tree (LeetCode level-order array, null for missing children) and arr',
  url: 'https://leetcode.com/problems/check-if-a-string-is-a-valid-sequence-from-root-to-leaves-path-in-a-binary-tree/description/',
  complexity: 'O(n) time for n tree nodes, with O(h) recursion depth. The visualization caps the tree at 15 positions, values at 0 to 9 and arr at 10 entries; the draft does not verify the official bounds.',
  examples: [
    { label: 'Valid path', input: '{"tree":[0,1,0,0,1,0,null,null,1,0,0],"arr":[0,1,0,1]}' },
    { label: 'Prefix ends early', input: '{"tree":[0,1,0,0,1,0,null,null,1,0,0],"arr":[0,0,1]}' },
    { label: 'Mismatch at root', input: '{"tree":[1,2,3],"arr":[2,3]}' },
  ],
}

export default function Problem1430Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PathMatchView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
