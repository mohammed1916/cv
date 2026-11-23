import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1694',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Phone number as a JSON string of digits, spaces and dashes',
  url: 'https://leetcode.com/problems/reformat-phone-number/',
  question: "Remove spaces and dashes from a phone number and group the digits into blocks of up to three.",
  approaches: [
    { name: "Greedy blocks", intuition: "Take blocks of three while more than four digits remain, then split the tail into a block of two and a block of two or three.", time: "O(n)", space: "O(n)" },
  ],
}

export default function Problem1694Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Separators are discarded first, so the blocks are cut only from the digits.</p>
      <p>Blocks of three are cut while more than four digits remain, which leaves a tail of 2, 3 or 4 digits that is handled as a special case.</p>
    </>}
  />
}
