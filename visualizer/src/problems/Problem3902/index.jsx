import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3902View from './Problem3902View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Start with the root level.' },
    { id: 'level', label: 'Level', description: 'Choose the reading direction for this level.' },
    { id: 'read', label: 'Read', description: 'Add a node that has the required child.' },
    { id: 'stop', label: 'Stop', description: 'A node lacks the required child, so the sum ends.' },
    { id: 'levelDone', label: 'Record', description: 'Store this level\'s sum.' },
    { id: 'done', label: 'Result', description: 'Report every level sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with tree: level-order values with null for empty slots',
  url: 'https://leetcode.com/problems/zigzag-level-sum-of-binary-tree/',
  complexity: 'O(n) time and O(n) space: each node is visited once to build the levels, then each level is read at most once. The visualization caps the tree at 12 nodes.',
  examples: [
    { label: 'Missing left first', input: '{"tree":[1,2,3,4,null,null,5]}' },
    { label: 'Mixed shape', input: '{"tree":[6,3,9,2,4,null,8,1,null,null,7]}' },
    { label: 'Single root', input: '{"tree":[0]}' },
    { label: 'Right-leaning run', input: '{"tree":[4,null,5,null,null,null,6]}' },
    { label: 'Extreme values, 12 nodes', input: '{"tree":[-9,9,-9,9,-9,9,-9,9,-9,9,-9,9]}' },
    { label: 'Long run: 25 slots, 12 nodes', input: '{"tree":[-9,null,null,-6,null,3,null,9,1,null,8,null,7,null,null,-6,null,null,null,null,3,6,-9,null,8]}' },
  ],
}

export default function Problem3902Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3902View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Odd levels are summed from the left and even levels from the right, and each sum stops before the first node that lacks the child that direction needs.</p>
  </>} />
}
