import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Find the nearest target for every position.' },
    { id: 'left', label: 'Left sweep', description: 'Distances to the last target seen on the left.' },
    { id: 'right', label: 'Right sweep', description: 'Keep the smaller distance to the right.' },
    { id: 'done', label: 'Complete', description: 'Every position has its answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 's and c (JSON object)',
  url: 'https://leetcode.com/problems/shortest-distance-to-a-character/',
  complexity: 'O(n) time and O(n) space for the answer.',
  examples: [
    { label: 'Between', input: '{"s":"mississippi","c":"p"}' },
    { label: 'Ends', input: '{"s":"banana","c":"n"}' },
  ],
}

export default function ShortestToCharacter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Characters of s (target '${run.input.c}' marked)`} length={run.input.s.length} active={step.i}
      valueAt={i => run.input.s[i]}
      roleAt={i => (run.input.s[i] === run.input.c ? 'target' : '')} />
    <IndexedSequence label="Distance to the nearest target so far" length={run.input.s.length} active={step.i}
      valueAt={i => (step.answer[i] === null || step.answer[i] === undefined ? '∞' : step.answer[i])}
      roleAt={i => (step.sweep === 'right' && i >= step.i ? 'settled' : '')} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A distance to the nearest target is the smaller of the distance to the target on the left and the one on the right. Two sweeps compute both.</p>
  </>} />
}
