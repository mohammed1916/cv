import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitWalkView from './DigitWalkView'
import './DigitWalkView.css'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Count up to b, then subtract the count up to a - 1.' },
    { id: 'zero', label: 'Zero', description: 'Start the count with the number 0.' },
    { id: 'short', label: 'Shorter', description: 'Every shorter length contributes a fixed block.' },
    { id: 'choose', label: 'Choose smaller', description: 'Each smaller unused digit fixes a prefix.' },
    { id: 'stop', label: 'Repeat', description: 'A repeated digit ends the walk for this bound.' },
    { id: 'mark', label: 'Keep prefix', description: 'Keep the bound digit and continue.' },
    { id: 'finish', label: 'Bound itself', description: 'The bound has distinct digits, so count it.' },
    { id: 'done', label: 'Result', description: 'Subtract the two counts.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with a and b (e.g. {"a":1,"b":20})',
  url: 'https://leetcode.com/problems/count-numbers-with-unique-digits-ii/',
  complexity: 'O(d * 10) time and O(1) extra space for d digits of b. The visualization caps b at 99999; the statement bounds in the source still need checking before publication.',
  examples: [
    { label: 'Small range', input: '{"a":1,"b":20}' },
    { label: 'Around one hundred', input: '{"a":100,"b":120}' },
    { label: 'Single digits', input: '{"a":0,"b":9}' },
  ],
}

export default function CountNumbersWithUniqueDigitsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DigitWalkView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Counting up to a bound, instead of testing every number, adds whole blocks at once: each smaller digit fixes a prefix, and the free places take any ordering of the unused digits.</p>
  </>} />
}
