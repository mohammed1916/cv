import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1629',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with releaseTimes (strictly increasing) and keysPressed (one lowercase letter per release)',
  url: 'https://leetcode.com/problems/slowest-key/',
}

export default function Problem1629Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>The first press lasts from time 0. Every later press lasts from the previous release to its own release.</p>
      <p>Only the longest duration matters, and ties are broken by the larger key letter.</p>
    </>}
  />
}
