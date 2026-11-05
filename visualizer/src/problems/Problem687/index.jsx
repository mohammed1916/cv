import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every node gets an arm length from its children.' },
    { id: 'node', label: 'Combine arms', description: 'Extend a child arm only when its value matches the parent.' },
    { id: 'done', label: 'Answer', description: 'The best path through any node.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/longest-univalue-path/',
  complexity: 'O(n) time and O(h) recursion space.',
  examples: [
    { label: 'Three equal', input: '[2,2,2,2,null,2]' },
    { label: 'Mixed', input: '[1,2,3,2,2,null,3]' },
    { label: 'Single', input: '[7]' },
  ],
}

export default function LongestUnivaluePath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = {}
    Object.entries(step.arms).forEach(([id, length]) => { tags[id] = `arm ${length}` })
    const roles = {}
    if (step.node !== null && step.node !== undefined) roles[step.node] = step.phase === 'done' ? 'best' : 'current'
    return <>
      <BinaryTreeLane title="Tree with arm lengths" root={run.root} roles={roles} tags={tags}
        note={`longest path ${step.best} edge(s)`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why two arms:</strong> a path that turns at a node uses one arm on each side, so the best answer through a node is the sum of its two arms.</p>
  </>} />
}
