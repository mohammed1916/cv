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
