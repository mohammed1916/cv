import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import PairTrellisView from './PairTrellisView'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number,
  question: "Turn binary string s1 into s2 with the fewest operations, where one operation sets a single 0 to 1 or clears two adjacent 1s.",
  approaches: [
    { name: "Two-state boundary DP", intuition: "Track the cheapest cost for each state at every boundary and take the transitions that match s2.", time: "O(n)", space: "O(1)" },
  ],
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function MinimumOperationsToTransformBinaryString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PairTrellisView run={run} step={step} />} renderReasoning={() => <>
    <p>The order of operations does not matter much: whichever clearing pairs are chosen, each needed 1 can be set just before its pair fires. So the only real decision is which adjacent pairs to clear, and the sets follow from that.</p>
    <p>An index touched by c pairs needs c - 1 sets between them, one more if it starts at 0, and one more if it must end at 1. With no pair it needs 1 set only when rising from 0 to 1, and a fall from 1 to 0 is impossible.</p>
    <p>Each index only feels the pairs on its two sides, so one bit of memory is enough: does a pair cross this boundary? Clearing the same pair twice never helps, so two states per boundary cover every plan.</p>
    <p>Only a single-character string can be impossible, because any longer string lets a 1 pair up with a neighbour that was set first.</p>
  </>} />
}
