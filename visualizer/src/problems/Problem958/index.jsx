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
    { label: 'Own case 1', input: '[2,3,4,5,6,7]' },
    { label: 'Own case 2', input: '[2,3,4,5,6,null,8]' },
    { label: 'Single node', input: '[1]' },
    { label: 'Single root', input: '[1]' },
    { label: 'Equal values', input: '[2,2,2]' },
    { label: 'Largest values with gaps', input: '[1000,null,1000,null,null,null,1000]' },
    { label: 'Long run: 30 nodes', input: '[953,959,179,788,736,453,712,214,166,215,928,294,179,293,176,400,980,372,749,197,306,147,864,205,628,785,695,269,262,295]' },
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
