import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Seed the queue with s1.' },
    { id: 'pop', label: 'Pop', description: 'Take the next string of the current level.' },
    { id: 'mismatch', label: 'First mismatch', description: 'Find the first index that differs from s2.' },
    { id: 'enqueue', label: 'Enqueue swap', description: 'A useful swap leads to a new string.' },
    { id: 'skip', label: 'Skip seen', description: 'The swapped string was already reached.' },
    { id: 'done', label: 'Complete', description: 'Report the swap count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Strings [s1, s2] (JSON, length up to 8, letters a-f)',
  url: 'https://leetcode.com/problems/k-similar-strings/',
  complexity: 'Worst case explores O(n!) strings, but fixing the first mismatch each time prunes branching to at most n per string. Capped at length 8 here.',
  examples: [
    { label: 'ab to ba', input: '["ab","ba"]' },
    { label: 'abc to bca', input: '["abc","bca"]' },
    { label: 'abccab to abccab', input: '["abccab","abccab"]' },
    { label: 'aabc to abca', input: '["aabc","abca"]' },
    { label: 'abcdefab to bcdefaab', input: '["abcdefab","bcdefaab"]' },
  ],
}

export default function KSimilarStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const target = run.input.s2
    const cur = step.cur ?? run.input.s1
    return <>
      <IndexedSequence label="Target s2" length={target.length} valueAt={i => target[i]} active={-1} />
      <IndexedSequence label="Current string" length={cur.length} valueAt={i => cur[i]} active={step.i}
        roleAt={i => i === step.j ? 'shifted' : cur[i] === target[i] ? 'written' : ''} />
      {step.next && <IndexedSequence label="After swap" length={step.next.length} valueAt={i => step.next[i]} active={step.i}
        roleAt={i => step.next[i] === target[i] ? 'written' : ''} />}
      <StackLane title={`BFS queue (front first, distance ${step.steps ?? 0}+)`} items={step.queue ?? []} note={`${step.queueSize ?? 0} queued, ${step.seenSize ?? 0} seen`} />
      <output aria-label="Result">{step.phase === 'done' ? `Answer: ${run.result}` : `Level: ${step.steps ?? 0} swaps so far`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>Current level (swaps used): {step.steps ?? 0}.</p>
    <p><strong>Why BFS:</strong> every level is one more swap, so the first time the target string pops, no shorter swap sequence exists.</p>
    <p><strong>Why only the first mismatch:</strong> some swap must put the right letter at the first wrong index, so we only try swaps that do that. We also require the donor letter to be misplaced, since moving a correct letter is never useful.</p>
  </>} />
}
