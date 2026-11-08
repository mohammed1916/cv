import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PlaceSplitView from './PlaceSplitView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1067',
  phases: [
    { id: 'start', label: 'Start', description: 'Count up to high, then subtract the count up to low - 1.' },
    { id: 'place', label: 'Place', description: 'Split the bound at one place value.' },
    { id: 'upper', label: 'Upper', description: 'The count up to high is complete.' },
    { id: 'lower', label: 'Lower', description: 'The count up to low - 1 is complete.' },
    { id: 'done', label: 'Result', description: 'Subtract the two counts.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with d (digit 0 to 9), low and high (1 <= low <= high)',
  url: 'https://leetcode.com/problems/digit-count-in-range/description/',
  complexity: 'O(log high) time and O(1) extra space: one pass over the decimal places of each bound. The visualization caps high at 99999; the official numeric bounds are not verified.',
  examples: [
    { label: 'Digit 3 from 20 to 40', input: '{"d":3,"low":20,"high":40}' },
    { label: 'Zeros up to 105', input: '{"d":0,"low":1,"high":105}' },
    { label: 'Single value', input: '{"d":5,"low":5,"high":5}' },
    { label: 'Single number, no zero digit', input: '{"d":0,"low":1,"high":1}' },
    { label: 'Top of the range', input: '{"d":9,"low":99990,"high":99999}' },
    { label: 'Largest range, digit one', input: '{"d":1,"low":1,"high":99999}' },
    { label: 'Long run: numbers 1000 to 9000', input: '{"d":7,"low":1000,"high":9000}' },
  ],
}

export default function DigitCountInRange() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PlaceSplitView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Counting up to a bound one place at a time avoids listing numbers; the range answer is the upper count minus the count below low.</p>}
    />
  )
}
