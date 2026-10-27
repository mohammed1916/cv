import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Seed', description: 'Queue starts with the root.' },
    { id: 'visit', label: 'Visit node', description: 'Dequeue a real node and enqueue both children.' },
    { id: 'null', label: 'First null', description: 'A null is dequeued; no real node may follow.' },
    { id: 'fail', label: 'Gap', description: 'A real node follows a null.' },
    { id: 'done', label: 'Complete', description: 'Report completeness.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree root (JSON level-order)',
  url: 'https://leetcode.com/problems/check-completeness-of-a-binary-tree/',
  complexity: 'O(n) time and space. The visualization caps input at 30 nodes.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,4,5,6]' },
    { label: 'Example 2', input: '[1,2,3,4,5,null,7]' },
    { label: 'Single node', input: '[1]' },
  ],
}

export default function CheckCompleteness() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.visited) roles[id] = 'visited'
    if (step.node !== null) roles[step.node] = step.phase === 'fail' ? 'pruned' : 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} />
      <IndexedSequence label="BFS queue (front first)" length={step.queue.length} valueAt={i => step.queue[i]} roleAt={i => step.queue[i] === 'null' ? 'dropped' : ''} />
      <output aria-label="Seen null">{step.seenNull ? 'A null has been seen' : 'No null seen yet'}</output>
    </>
  }} renderReasoning={() => <>
    <p>A complete tree fills every level except possibly the last, which fills left to right. Written in level order including null slots, that means real nodes first, then only nulls.</p>
    <p>BFS visits slots in exactly level order, so a real node after the first null proves a hole to its left.</p>
  </>} />
}
