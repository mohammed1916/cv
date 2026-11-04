import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RemainderFlowView from './RemainderFlowView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function FindXValueOfArrayI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RemainderFlowView run={run} step={step} />} renderReasoning={() => <>
    <p>Removing a prefix and a suffix always leaves one contiguous block, and each block comes from exactly one choice. So the task is to count blocks by the remainder of their product.</p>
    <p>A block's next remainder depends only on its current remainder and the value added, not on its members. Blocks sharing a remainder can therefore be moved together as a single count.</p>
    <p>k is at most 5, so each value needs only a handful of moves, however long the array is. The listed blocks are for teaching; the algorithm keeps only the counts.</p>
  </>} />
}
