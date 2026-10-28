import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Queue root', description: 'Put the root in the queue as level 1.' },
    { id: 'level', label: 'Sum level', description: 'Add up the values of every node on the current level.' },
    { id: 'better', label: 'New best', description: 'This level beats the best sum so far, so it becomes the best level.' },
    { id: 'keep', label: 'Keep best', description: 'This level does not beat the best sum, so the earlier level stays.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest level with the largest sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with values: level-order array (null = missing)',
  url: 'https://leetcode.com/problems/maximum-level-sum-of-a-binary-tree/',
  complexity: 'O(n) time and O(w) space for the widest level. The visualization caps input at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"values":[1,7,0,7,-8,null,null]}' },
    { label: 'Example 2', input: '{"values":[989,null,10250,98693,-89388,null,null,null,-32127]}' },
  ],
}

export default function MaximumLevelSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.ids) roles[id] = 'match'
    return <>
      <BinaryTreeLane title="Tree (values)" root={run.root} roles={roles} />
      <output aria-label="Level sums">{step.level ? `Level ${step.level} sum: ${step.levelSum}. ` : ''}{`Best so far: level ${step.bestLevel ?? '-'}, sum ${step.bestSum ?? '-'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A breadth-first walk visits one level at a time, so each level sum is available as soon as that level is complete.</p>
    <p>The comparison is strict, so a later level with an equal sum never replaces the earlier one.</p>
  </>} />
}
