import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Set the time bounds from one worker doing the whole mountain.' },
    { id: 'probe', label: 'Test time', description: 'Count how many layers each worker can remove within the candidate time.' },
    { id: 'done', label: 'Answer', description: 'Report the smallest time that removes the whole mountain.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with mountainHeight (1 to 12) and workerTimes (1 to 4 values, 1 to 8) (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-seconds-to-make-mountain-height-zero/',
  complexity: 'O(log(time bound) * workers * sqrt(time bound)) time. The visualization caps the input at 4 workers.',
  examples: [
    { label: 'Two workers, height seven', input: '{"mountainHeight":7,"workerTimes":[1,4]}' },
    { label: 'Three workers, height three', input: '{"mountainHeight":3,"workerTimes":[6,6,2]}' },
    { label: 'Single layer, one worker', input: '{"mountainHeight":1,"workerTimes":[1]}' },
    { label: 'Equal workers', input: '{"mountainHeight":6,"workerTimes":[2,2,2,2]}' },
    { label: 'Largest height, slow workers', input: '{"mountainHeight":12,"workerTimes":[8,8,8,8]}' },
    { label: 'Long run: twelve layers, four workers', input: '{"mountainHeight":12,"workerTimes":[2,7,8,5]}' },
  ],
}

export default function MinimumSecondsMountain() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Time search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <IndexedSequence label="Layers removed per worker" length={run.input.workerTimes.length} valueAt={i => step.cuts[i]} roleAt={i => `time ${run.input.workerTimes[i]}`} />
    <output aria-label="Layers removed">{`Total layers removed: ${step.cuts.reduce((a, b) => a + b, 0)} of ${run.input.mountainHeight}`}</output>
  </>} renderReasoning={() => <>
    <p>A worker with time t removes layers 1, 2, 3, ... at a cost of t, 3t, 6t, ... seconds, so the cost grows with each extra layer.</p>
    <p>For a fixed total time, each worker can remove as many layers as fit, and a longer time never removes fewer, so the smallest workable time is found by binary search.</p>
  </>} />
}
