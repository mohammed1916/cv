import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import View from './View'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm.js'

const definition = {
  number: '1716',
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  phases,
  examples,
  complexity,
  inputLabel: 'Integer n of days, from 1 to 1000',
  url: 'https://leetcode.com/problems/calculate-money-in-leetcode-bank/',
  question: "Calculate the total money saved in a bank over n days when the daily deposit grows by one each day and resets each Monday.",
  approaches: [
    { name: "Simulate day by day", intuition: "Add each day's deposit, resetting the base each Monday.", time: "O(n)", space: "O(1)" },
  ],
}

export default function Problem1716Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <View run={run} step={step} />}
    renderReasoning={() => <>
      <p>Within a week the deposits rise by one each day. Each new week starts one higher than the Monday before.</p>
      <p>So day i deposits the week number plus the weekday offset plus one, and the total is their sum.</p>
    </>}
  />
}
