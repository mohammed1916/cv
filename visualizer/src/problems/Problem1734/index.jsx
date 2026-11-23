import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1734',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'JSON array of encoded values (even length, so the permutation length is odd)',
  url: 'https://leetcode.com/problems/decode-xored-permutation/',
  question: "Recover a permutation from the XOR of each adjacent pair.",
  approaches: [
    { name: "Odd positions, then chain", intuition: "The XOR of 1 through n with the odd-index encoded values gives the first element; chain XOR to get the rest.", time: "O(n)", space: "O(n)" },
  ],
}

export default function Problem1734Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>XOR of a whole permutation of 1 to n is fixed. Pairing neighbours cancels every value except the first and last.</p>
      <p>Taking the odd-positioned encoded values gives everything except perm[0], so perm[0] follows from the total.</p>
    </>}
  />
}
