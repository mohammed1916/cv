import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root and XOR', description: 'Root the tree and find the XOR of each subtree.' },
    { id: 'pair', label: 'Cut pairs', description: 'Try each pair of cut edges and score the three parts.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and edges of a tree (JSON)',
  url: 'https://leetcode.com/problems/minimum-score-after-removals-on-a-tree/',
  complexity: 'O(n^2) time over pairs of cut edges, after one O(n) pass for subtree XORs. The visualization caps the tree at 12 nodes.',
  examples: [
    { label: 'Path', input: '{"nums":[1,2,3],"edges":[[0,1],[1,2]]}' },
    { label: 'Star', input: '{"nums":[4,4,4,4],"edges":[[0,1],[0,2],[0,3]]}' },
  ],
}

export default function MinimumScoreTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, edges } = run.input
    const [u, v] = step.pair ?? [-1, -1]
    return <>
      <IndexedSequence label="Node values" length={nums.length} valueAt={i => `${nums[i]} (xor ${step.sub[i]})`} active={u}
        roleAt={i => (i === u || i === v ? 'cut' : '')} />
      <output aria-label="Edges">{`Edges: ${edges.map(([a, b]) => `${a}-${b}`).join(', ')}`}</output>
      <output aria-label="Current cut">{step.parts ? `Cutting above ${u} and ${v} gives xors ${step.parts.join(', ')}; score ${step.score}.` : `Total xor ${step.total}. Best so far: ${step.best ?? 'none'}.`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two cut edges split the tree into three parts. If one cut lies above the other, the parts are a lower subtree, the middle part, and the rest.</p>
    <p>Subtree XORs make each part a single value, so each pair of cuts is scored in constant time.</p>
  </>} />
}
