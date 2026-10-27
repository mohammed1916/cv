import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Start with an empty stack of chunk maxima.' },
    { id: 'push', label: 'New chunk', description: 'The value is not smaller than the last chunk maximum.' },
    { id: 'merge', label: 'Merge chunks', description: 'A smaller value forces earlier chunks to merge.' },
    { id: 'done', label: 'Complete', description: 'The stack size is the chunk count.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array arr (JSON, 1-200 integers)',
  url: 'https://leetcode.com/problems/max-chunks-to-make-sorted-ii/',
  complexity: 'O(n) time and O(n) space with the monotonic stack.',
  examples: [
    { label: '[5,4,3,2,1]', input: '[5,4,3,2,1]' },
    { label: '[2,1,3,4,4]', input: '[2,1,3,4,4]' },
    { label: 'Merging', input: '[1,3,2,2,5,4,6]' },
  ],
}
export default function MaxChunksII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (i < step.index ? 'seen' : '')} />
    <StackLane title="Chunk maxima stack" items={step.stack} note={step.held !== undefined ? `held: ${step.held}` : undefined} />
    <output aria-label="Chunk count">{step.phase === 'done' ? 'Maximum chunks' : 'Chunks so far'}: {step.stack.length}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Invariant:</strong> the stack is non-decreasing, so each chunk maximum is at most the next chunk's minimum. A new value smaller than a chunk's maximum would break the sorted concatenation, so it merges those chunks.</p>
  </>} />
}
