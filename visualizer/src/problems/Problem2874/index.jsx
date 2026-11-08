import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Suffix maxima', description: 'Find the largest value to the right of each index.' },
    { id: 'middle', label: 'Middle', description: 'Pair the largest earlier value with the middle value and the best later value.' },
    { id: 'done', label: 'Complete', description: 'Report the best triplet value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with an integer array nums (values 1 to 50)',
  url: 'https://leetcode.com/problems/maximum-value-of-an-ordered-triplet-ii/',
  complexity: 'O(n) time and O(n) space. The visualization caps the array at twelve values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[12,6,1,2,7]}' },
    { label: 'Example 2', input: '{"nums":[1,10,3,4,19]}' },
    { label: "Smallest length", input: "{\"nums\":[1,1,1]}" },
    { label: "Equal values", input: "{\"nums\":[2,2,2,2]}" },
    { label: "Largest values, 12 entries", input: "{\"nums\":[50,49,50,1,50,50,2,50,50,50,50,50]}" },
    { label: "Long run: 12 entries", input: "{\"nums\":[18,49,34,3,41,28,8,34,28,35,41,45]}" },
  ],
}

export default function MaximumOrderedTriplet() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} />
    <output aria-label="Triplet state">{`Largest before middle: ${step.before}, best: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>For a fixed middle index j, the value is (largest before j minus nums[j]) times the largest after j.</p>
    <p>A negative gap can never help, so the answer never drops below zero.</p>
  </>} />
}
