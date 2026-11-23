import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1726',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of distinct positive integers',
  url: 'https://leetcode.com/problems/tuple-with-same-product/',
  question: "Count the tuples of four distinct values where a times b equals c times d.",
  approaches: [
    { name: "Count products in a map", intuition: "Count pairs by product, then add the ordered combinations for each product with several pairs.", time: "O(n^2)", space: "O(n^2)" },
  ],
}

export default function Problem1726Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>a × b = c × d with all four distinct means the two pairs share a product. Each such pair of pairs gives 8 orders.</p>
      <p>Counting pairs by product turns the problem into a count of pairs per product, then c choose 2 for each product.</p>
    </>}
  />
}
