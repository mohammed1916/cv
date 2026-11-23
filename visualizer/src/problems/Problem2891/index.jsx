import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MethodChainView from './MethodChainView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  question: "Return the names of animals whose weight is above a threshold, sorted by weight from heaviest to lightest, using chained steps.",
  approaches: [
    { name: "Filter then sort then project", intuition: "Filter by the weight condition, sort the remaining rows, and keep the name column.", time: "O(n log n)", space: "O(n)" },
    { name: "Sort first then filter", intuition: "Sort all rows first and filter afterwards, same result with more work.", time: "O(n log n)", space: "O(n)" },
  ],
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

export default function MethodChaining() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MethodChainView run={run} step={step} />} renderReasoning={() => <>
    <p>Each pandas call hands back a new DataFrame, so the next call can attach directly to it and no temporary variable is needed.</p>
    <p>The order of the links matters. Filtering first means the sort touches fewer rows, and the name column can only go last because the sort still needs weight.</p>
  </>} />
}
