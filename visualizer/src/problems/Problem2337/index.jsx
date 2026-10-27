import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Both pointers begin at the first position.' },
    { id: 'match', label: 'Match', description: 'Pair the next pieces and check their direction.' },
    { id: 'stop', label: 'End', description: 'One string has no pieces left.' },
    { id: 'fail', label: 'Impossible', description: 'The pieces cannot line up.' },
    { id: 'done', label: 'Complete', description: 'Report whether the target is reachable.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two strings of L, R and _ as JSON, e.g. {"start": "_L__R", "target": "L___R"}',
  url: 'https://leetcode.com/problems/move-pieces-to-obtain-a-string/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps strings at 12 characters.',
  examples: [
    { label: 'Example 1', input: '{"start": "_L__R__R_", "target": "L______RR"}' },
    { label: 'Example 2', input: '{"start": "R_L_", "target": "__LR"}' },
  ],
}

export default function MovePieces() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <IndexedSequence label="start" length={run.input.start.length} valueAt={i => run.input.start[i]} active={step.i < run.input.start.length ? step.i : -1} />
      <IndexedSequence label="target" length={run.input.target.length} valueAt={i => run.input.target[i]} active={step.j < run.input.target.length ? step.j : -1} />
      <output aria-label="Current step">{step.message}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>Pieces never pass each other, so the k-th non-blank piece of start must become the k-th non-blank piece of target.</p>
      <p>An L can only move left and an R can only move right, which is a direction check on each matched pair.</p>
    </>
  )} />
}
