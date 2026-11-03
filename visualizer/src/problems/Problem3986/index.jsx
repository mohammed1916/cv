import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ClockSpanView from './ClockSpanView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3986',
  phases: [
    { id: 'start', label: 'Start', description: 'Convert the start clock to seconds.' },
    { id: 'end', label: 'End', description: 'Convert the end clock to seconds.' },
    { id: 'difference', label: 'Subtract', description: 'Take the difference of the two counts.' },
    { id: 'done', label: 'Result', description: 'Report the elapsed seconds.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with start and end in HH:MM:SS (e.g. {"start":"08:15:30","end":"09:45:10"})',
  url: 'https://leetcode.com/problems/number-of-elapsed-seconds-between-two-times/',
  complexity: 'O(1) time and space. Each clock is parsed once into seconds past midnight.',
  examples: [
    { label: 'Morning span', input: '{"start":"08:15:30","end":"09:45:10"}' },
    { label: 'One second', input: '{"start":"23:59:58","end":"23:59:59"}' },
    { label: 'Same instant', input: '{"start":"12:00:00","end":"12:00:00"}' },
  ],
}

export default function NumberOfElapsedSeconds() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <ClockSpanView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Seconds past midnight turn a clock reading into a single number, so the span is one subtraction.</p>
    </>} />
}
