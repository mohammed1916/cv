import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'The root is the only node on level 0.' },
    { id: 'visit', label: 'Add a node', description: 'Add each node on the current level to a running sum.' },
    { id: 'level', label: 'Average level', description: 'Divide the sum by the number of nodes on the level.' },
    { id: 'done', label: 'Complete', description: 'Return the average of every level.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/average-of-levels-in-binary-tree/',
  complexity: 'O(n) time for n nodes, and O(w) extra space for the widest level.',
  examples: [
    { label: 'Balanced', input: '[1,2,3,4]' },
    { label: 'Gap', input: '[5,-2,8,null,6]' },
    { label: 'Single', input: '[7]' },
  ],
}

export default function AverageOfLevels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.seen.forEach(id => { roles[id] = 'done' })
    step.levelIds.forEach(id => { roles[id] = 'level' })
    if (step.current !== null) roles[step.current] = 'current'
    return <>
      <BinaryTreeLane title="Tree by level" root={run.root} roles={roles} note={step.phase === 'done' ? 'all levels averaged' : `level ${step.depth}`} />
      <RecordStateTable label="Level averages" columns={['level', 'average']}
        rows={step.averages.map((average, level) => ({ level, average: Number(average.toFixed(5)) }))} activeRow={step.averages.length - 1} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why per level:</strong> the average needs every node of one depth at once, so the walk finishes a whole level before it moves to its children.</p>
  </>} />
}
