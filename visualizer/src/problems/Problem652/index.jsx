import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bottom-up', description: 'Serialize children before their parent.' },
    { id: 'visit', label: 'New subtree', description: 'Record the serialization.' },
    { id: 'duplicate', label: 'Repeat found', description: 'This serialization appeared before.' },
    { id: 'done', label: 'Complete', description: 'Return one root per repeated subtree.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/find-duplicate-subtrees/',
  complexity: 'O(n²) time in the worst case with string serialization, and O(n²) space for the serialized keys.',
  examples: [
    { label: 'Two repeats', input: '[1,2,3,4,null,2,4,null,null,4]' },
    { label: 'Repeated leaves', input: '[2,1,1]' },
    { label: 'No repeat', input: '[2,2,2,3,null,3,null]' },
  ],
}

export default function DuplicateSubtrees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    step.duplicateIds?.forEach?.(id => { roles[id] = 'match' })
    run.duplicateIds.forEach(id => { roles[id] = 'match' })
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} note="green: root of a repeated subtree" />
      <output aria-label="Duplicate roots">Repeated roots so far: [{step.duplicates.join(', ')}]</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Signature:</strong> a subtree is equal to another exactly when value and both children's signatures match, so a string serialization identifies it.</p>
  </>} />
}
