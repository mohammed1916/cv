import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SpecialGridView from './SpecialGridView'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples, url } from './algorithm'
import { meta } from './meta'

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples, url }

export default function FillASpecialGrid() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <SpecialGridView run={run} step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>The comparison rule tells us how to share out the values. Four equal quadrants need four equal runs of consecutive values, and the rule forces their order: top-right lowest, then bottom-right, bottom-left and top-left.</p>
      <p>Every quadrant is then the same task on a smaller square with its own run of values, so the recursion ends at a single cell, which holds the one value it owns. Runs never overlap, so the rule holds at every level without any check in the code.</p>
    </>} />
}
