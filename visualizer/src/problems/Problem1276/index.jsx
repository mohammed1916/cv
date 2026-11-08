import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1276',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with tomatoSlices and cheeseSlices (JSON)',
  url: 'https://leetcode.com/problems/number-of-burgers-with-no-waste-of-ingredients/',
  complexity: 'O(1): two linear equations in two unknowns are solved directly.',
  examples: [
    { label: 'Exact mix', input: '{"tomatoSlices":14,"cheeseSlices":5}' },
    { label: 'Odd tomato', input: '{"tomatoSlices":3,"cheeseSlices":1}' },
    { label: 'Too much cheese', input: '{"tomatoSlices":2,"cheeseSlices":5}' },
    { label: 'No slices', input: '{"tomatoSlices":0,"cheeseSlices":0}' },
    { label: 'Only tomatoes', input: '{"tomatoSlices":4,"cheeseSlices":0}' },
    { label: 'Largest counts', input: '{"tomatoSlices":1000000,"cheeseSlices":1000000}' },
    { label: 'Long run: large exact mix', input: '{"tomatoSlices":999998,"cheeseSlices":499999}' },
  ],
}

export default function BurgerCounts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { halves, jumbo, small, ok } = step.snapshot
    return <>
      <p>Tomato equation: 4x + 2y = {run.input.tomatoSlices}</p>
      <p>Cheese equation: x + y = {run.input.cheeseSlices}</p>
      {halves !== null && <p>Halved tomato count: {halves}</p>}
      {jumbo !== null && <p>Jumbo x = {jumbo}, small y = {small}</p>}
      {ok !== null && <p>{ok ? 'Both counts are nonnegative.' : 'The counts do not form an exact nonnegative pair.'}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Substitute:</strong> y = cheese - x turns the tomato equation into 2x + 2 cheese = tomato, so x = tomato/2 - cheese.</p>
    <p><strong>Validate:</strong> the answer exists only when tomato is even and both counts are nonnegative.</p>
  </>} />
}
