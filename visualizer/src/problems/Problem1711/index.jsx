import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1711',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of meal values (0 to 2^20)',
  url: 'https://leetcode.com/problems/count-good-meals/',
  question: "Count pairs of meals whose deliciousness values sum to a power of two.",
  approaches: [
    { name: "Hash count over powers", intuition: "For each value, look up each power of two minus that value in a count map.", time: "O(n log V)", space: "O(n)" },
  ],
}

export default function Problem1711Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>For a meal v, the partner must be 2^p minus v for some power 2^p. Only 22 powers can be reached by two values up to 2^20.</p>
      <p>Counting partners as we go means each pair is counted exactly once, by its later meal.</p>
    </>}
  />
}
