import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { shelfTutorial } from './tutorial'
import {shelfVisuals} from './visuals'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function BookshelfVisual() {
  return <AlgorithmWorkspace definition={definition} tutorial={shelfTutorial} visuals={shelfVisuals}
    renderReasoning={() => <p>Books keep their order. Price each possible last shelf using the solved prefix before it.</p>} />
}
