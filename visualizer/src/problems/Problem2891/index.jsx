import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MethodChainView from './MethodChainView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
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
