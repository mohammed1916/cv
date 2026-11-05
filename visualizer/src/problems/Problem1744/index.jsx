import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1744',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with candies (count per type) and queries ([type, day, cap] triples)',
  url: 'https://leetcode.com/problems/can-you-eat-your-favorite-candy-on-your-favorite-day/',
}

export default function Problem1744Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Candies are eaten in the order of their types. Your favourite type occupies a fixed range of candy numbers.</p>
      <p>By day d you have eaten between d+1 and (d+1)×cap candies. The two ranges must overlap, which gives two simple checks.</p>
    </>}
  />
}
