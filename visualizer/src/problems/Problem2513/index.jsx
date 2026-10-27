import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Set the search bounds for the largest value.' },
    { id: 'probe', label: 'Count numbers', description: 'Count the numbers each set may use and the numbers both may share.' },
    { id: 'done', label: 'Answer', description: 'Report the smallest limit where both sets fit.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with divisor1, divisor2 (2 to 10) and uniqueCnt1, uniqueCnt2 (1 to 8) (JSON)',
  url: 'https://leetcode.com/problems/minimize-the-maximum-of-two-arrays/',
  complexity: 'O(log(uniqueCnt1 + uniqueCnt2)) time with constant counting work per probe.',
  examples: [
    { label: 'Example 1', input: '{"divisor1":2,"divisor2":7,"uniqueCnt1":1,"uniqueCnt2":3}' },
    { label: 'Example 2', input: '{"divisor1":3,"divisor2":5,"uniqueCnt1":2,"uniqueCnt2":1}' },
  ],
}

export default function MinimizeMaxOfTwoArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Largest value search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <table aria-label="Available numbers at this limit">
      <tbody>
        <tr><th scope="row">Usable by set one</th><td>{step.counts.free1}</td><th scope="row">needed</th><td>{run.input.uniqueCnt1}</td></tr>
        <tr><th scope="row">Usable by set two</th><td>{step.counts.free2}</td><th scope="row">needed</th><td>{run.input.uniqueCnt2}</td></tr>
        <tr><th scope="row">Usable by either set</th><td>{step.counts.freeBoth}</td><th scope="row">needed together</th><td>{run.input.uniqueCnt1 + run.input.uniqueCnt2}</td></tr>
      </tbody>
    </table>
  </>} renderReasoning={() => <>
    <p>Set one may not use multiples of divisor1, and set two may not use multiples of divisor2. Each set needs enough usable numbers, and the two sets together need enough numbers that at least one of them may use.</p>
    <p>These three counts are the whole condition, so checking them for a candidate limit is enough.</p>
  </>} />
}
