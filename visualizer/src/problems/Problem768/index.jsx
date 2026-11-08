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
    { label: 'Merging', input: '[1,3,2,2,5,4,6]' }, { label: 'Single element', input: '[0]' }, { label: 'Equal values', input: '[1,1,1,1]' }, { label: 'Largest values', input: '[100000000,0,100000000]' }, { label: 'Long run: 200 values', input: '[231,481,70,215,181,623,993,594,316,706,874,311,246,701,789,844,64,438,381,715,942,951,111,537,3,933,583,25,885,491,553,841,406,798,376,563,946,906,985,396,167,875,624,320,191,293,865,386,407,139,919,31,667,250,215,43,806,998,709,410,149,602,957,783,444,4,946,671,175,278,913,558,378,469,374,832,496,52,637,800,542,592,105,868,920,629,871,702,785,103,539,642,6,530,577,750,187,97,572,348,188,545,849,73,589,270,188,280,489,516,265,39,149,38,299,520,101,633,959,232,684,225,577,947,383,417,77,508,114,382,790,592,857,557,697,211,863,15,442,289,50,259,92,117,724,667,173,476,161,196,975,458,711,34,855,131,544,57,520,322,777,116,408,773,822,768,937,741,946,745,216,241,43,898,512,940,51,193,711,809,214,120,207,877,322,371,893,587,305,280,588,129,368,681,370,449,667,283,273,888]' },
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
