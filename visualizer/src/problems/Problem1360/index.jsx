import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  question: "Count the days between two calendar dates.",
  approaches: [
    { name: "Day-number conversion", intuition: "Convert each date to a day count and subtract.", time: "O(1)", space: "O(1)" },
  ],
  number: '1360', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with first and second dates (JSON)',
  url: 'https://leetcode.com/problems/number-of-days-between-two-dates/',
  complexity: 'O(years) time for the day counts here, or O(1) with a closed-form calendar formula, and O(1) space.',
}

export default function DateGapVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <StackLane title="Dates" items={[`first ${s.first}`, `second ${s.second}`]} />
      <StackLane title="Day numbers from 1900-01-01" items={[s.a ?? '…', s.b ?? '…']} note={s.result !== undefined ? `difference ${s.result}` : undefined} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Count, then subtract:</strong> each date becomes one number of days, so the gap is the absolute difference, whichever date comes first.</p>
    <p>{step.message}</p>
  </>} />
}
