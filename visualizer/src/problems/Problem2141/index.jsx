import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2141',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with n and batteries',
  url: 'https://leetcode.com/problems/maximum-running-time-of-n-computers/',
  complexity: 'O(m log S) time for m batteries and total minutes S; O(1) extra space.',
  examples: [
    { label: 'Even split', input: '{"n":2,"batteries":[5,4,2]}' },
    { label: 'One large battery', input: '{"n":3,"batteries":[10,2,2,1]}' },
    { label: 'One computer', input: '{"n":1,"batteries":[4]}' },
    { label: 'Equal batteries', input: '{"n":2,"batteries":[3,3,3,3]}' },
    { label: 'Not enough energy', input: '{"n":3,"batteries":[1,1]}' },
    { label: 'Largest bank of batteries', input: '{"n":20,"batteries":[100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000,100000]}' },
    { label: 'Long run: 40 batteries', input: '{"n":10,"batteries":[38679,64126,67246,33598,18202,57364,74055,89934,53048,60321,37199,4530,45578,16305,58467,29272,48431,23599,52863,21418,41505,22920,93759,93813,59646,8264,69823,20069,16767,39643,89690,2662,76643,97645,54509,97347,86980,27945,55827,72713]}' },
  ],
}

export default function Problem2141Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <AnswerRangeBar title="Search for the longest feasible running time" min={0} max={Math.max(1, step.hi)} low={step.lo} high={step.hi} probe={step.probe} verdict={step.verdict} />
          <IndexedSequence label={`Batteries capped at the tested time (n = ${run.input.n})`} length={run.input.batteries.length} valueAt={i => (step.probe === null ? run.input.batteries[i] : Math.min(run.input.batteries[i], step.probe))} active={-1} roleAt={() => ''} />
          {step.need !== null && <p>Minutes available {step.usable}, needed {step.need}.</p>}
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
