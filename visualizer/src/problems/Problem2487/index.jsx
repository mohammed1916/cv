import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2487',
  phases: [
    { id: 'scan', label: 'Scan', description: 'Walk the list left to right; a larger value removes the smaller values before it.' },
    { id: 'done', label: 'Result', description: 'The kept nodes, in order, form the new list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"values": [4, 9, 1, 7, 2]}',
  url: 'https://leetcode.com/problems/remove-nodes-from-linked-list/',
  complexity: 'O(n) time and O(n) space for the kept stack. Each node is pushed and popped once.',
  examples: [
    { label: 'Example', input: '{"values":[4,9,1,7,2]}' },
    { label: 'Equal', input: '{"values":[1,1,1]}' },
  ],
}

export default function RemoveNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const values = run.input.values
    return <>
      <IndexedSequence label="list (head first)" length={values.length} valueAt={i => values[i]} active={step.i}
        roleAt={i => (i === step.i ? 'current' : i < step.i + 1 && !step.kept.includes(values[i]) ? 'removed' : '')} />
      <p aria-label="Kept nodes">{`kept so far: ${step.kept.join(' -> ') || 'none'}`}</p>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A node must go when a larger value appears somewhere to its right. Walking from the head, a new value removes the smaller kept values before it, because each of them now has a larger value to its right.</p>
    <p>A kept node has no larger value after it, so the stack left at the end is exactly the new list in its original order.</p>
  </>} />
}
