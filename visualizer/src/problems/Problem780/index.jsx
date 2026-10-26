import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Begin at the target and reason backwards.' },
    { id: 'reverse', label: 'Reverse steps', description: 'Replace the larger coordinate by its remainder modulo the smaller.' },
    { id: 'finish', label: 'Final check', description: 'Compare the shrunken pair with the start.' },
    { id: 'done', label: 'Complete', description: 'Report reachability.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Object {sx, sy, tx, ty} (JSON)',
  url: 'https://leetcode.com/problems/reaching-points/',
  complexity: 'O(log(max(tx, ty))) time like Euclid\'s algorithm, O(1) space.',
  examples: [
    { label: '(1,1) -> (3,5) true', input: '{"sx":1,"sy":1,"tx":3,"ty":5}' },
    { label: '(1,1) -> (2,2) false', input: '{"sx":1,"sy":1,"tx":2,"ty":2}' },
    { label: '(1,1) -> (1,1) true', input: '{"sx":1,"sy":1,"tx":1,"ty":1}' },
    { label: 'Huge target', input: '{"sx":9,"sy":5,"tx":1000000000,"ty":7}' },
  ],
}
export default function ReachingPoints() {
  const target = run => [run.input.sx, run.input.sy]
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Start (sx, sy)" length={2} valueAt={i => target(run)[i]} />
    <IndexedSequence label="Current backward point (tx, ty)" length={2} valueAt={i => [step.tx, step.ty][i]} roleAt={i => (i === 0 ? 'x' : 'y')} />
    <output aria-label="Verdict">{step.phase === 'done' ? `Reachable: ${run.result}` : 'Working backwards...'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why backwards:</strong> forward there are two choices, but backwards the larger coordinate must be the sum, so the predecessor is unique. Subtracting repeatedly is replaced by one modulo, exactly like Euclid's algorithm.</p>
  </>} />
}
