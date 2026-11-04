import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AlternatingPathView from './AlternatingPathView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function MinimumCostPathWithAlternatingDirectionsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <AlternatingPathView run={run} step={step} />} renderReasoning={() => <>
    <p>Because moves and waits strictly alternate, the timing never offers a choice: only the route does. Every cell on a route charges one entry and, unless it is the first or last cell, one wait.</p>
    <p>Moves only go right or down, so a cell can be entered from just two neighbours, both finished earlier in row order. Its cheapest total is the cheaper neighbour's total plus that neighbour's wait plus its own entry.</p>
  </>} />
}
