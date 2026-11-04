import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RollbackWindowView from './RollbackWindowView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function ThresholdMajorityQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <RollbackWindowView run={run} step={step} />} renderReasoning={() => <>
    <p>The threshold is only a final check. If any value reaches the threshold then the most frequent value does too, so each query comes down to finding the mode of a range, with the smaller value winning a tie, and comparing its count.</p>
    <p>Recounting every range is too slow, so the queries are answered in a chosen order and the window is reused. Adding an entry updates the mode in one step. Removing one is the hard direction: when the mode loses a count, nothing says which value is now the most frequent.</p>
    <p>So this version never has to remove for real. Queries are grouped by the block holding l. Within a group they are sorted by r, so the right edge only moves forward and its additions are kept. The left part, at most one block long, is added for one query, then undone by decrementing counts and restoring the mode saved beforehand.</p>
    <p>A query that ends inside its own block has no permanent part. Sorting by r puts these first in the group, while the counts are still empty, and they are handled entirely by the temporary step.</p>
  </>} />
}
