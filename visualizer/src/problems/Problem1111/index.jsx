import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel, url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function MaxNestingDepthTwoGroupsVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Brackets" length={run.input.length}
      valueAt={index => run.input[index]}
      roleAt={index => index === step.snapshot.current ? 'current' : ''}
      active={step.snapshot.current} />
    <IndexedSequence label="Group labels" length={run.input.length}
      valueAt={index => index < step.snapshot.groups.length ? step.snapshot.groups[index] : '·'}
      active={step.snapshot.current} />
    <p>Current depth: {step.snapshot.depth}</p>
  </>} renderReasoning={({ step }) => <>
    <p>Pairs at the same nesting level share a parity. Giving each bracket the parity of its depth splits the nesting layers alternately between the two groups, so each group stays balanced and its deepest layer is about half the original depth.</p>
    <p>{step.message}</p>
  </>} />
}
