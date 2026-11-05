import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1626',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Object with scores and ages, equal-length arrays (1 to 12 players in this visual)',
  url: 'https://leetcode.com/problems/best-team-with-no-conflicts/',
}

export default function Problem1626Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>After sorting by age, a team is conflict-free when its scores never drop as the players get older.</p>
      <p>The best team ending at a player is that player's score plus the best team ending at any earlier player with a score no higher.</p>
    </>}
  />
}
