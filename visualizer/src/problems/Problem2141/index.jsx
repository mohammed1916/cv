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
