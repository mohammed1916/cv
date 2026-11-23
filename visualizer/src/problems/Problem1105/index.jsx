import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { shelfTutorial } from './tutorial'
import {shelfVisuals} from './visuals'

const definition = {
  question: "Place books in order onto shelves of a fixed width so that the total height of the shelves is as small as possible.",
  approaches: [
    { name: "DP over prefixes", intuition: "For each prefix, try placing the last shelf with a range of books and keep the smallest total height.", time: "O(n^2)", space: "O(n)" },
  ],
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function BookshelfVisual() {
  return <AlgorithmWorkspace definition={definition} tutorial={shelfTutorial} visuals={shelfVisuals}
    renderReasoning={() => <p>Books keep their order. Price each possible last shelf using the solved prefix before it.</p>} />
}
