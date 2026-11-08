import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No expression is scored yet.' },
    { id: 'pick', label: 'Pick', description: 'Subtract one index and take the two largest of the others.' },
    { id: 'update', label: 'Update', description: 'Keep the larger score.' },
    { id: 'done', label: 'Result', description: 'Report the maximum expression.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (at least 3 integers)',
  url: 'https://leetcode.com/problems/maximize-expression-of-three-elements/',
  complexity: 'O(n log n) in this trace, which sorts the other values for each subtracted index.',
  examples: [
    { label: 'Example', input: '{"nums":[1,4,2,5]}' },
    { label: 'Ascending', input: '{"nums":[1,2,3,4]}' },
    { label: "Three equal values", input: "{\"nums\":[0,0,0]}" },
    { label: "Descending start", input: "{\"nums\":[-3,-1,-2]}" },
    { label: "Extremes alternate at 16", input: "{\"nums\":[-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20,-20,20]}" },
    { label: "Long run: 16 values", input: "{\"nums\":[2,8,-20,-10,-14,-19,-15,9,-16,3,-13,11,-1,10,-19,13]}" },
  ],
}

export default function MaximizeExpressionOfThreeElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (i === step.at ? 'c' : i === step.a ? 'a' : i === step.b ? 'b' : '')} />
    <output aria-label="Expression state">{`subtract index ${step.at >= 0 ? step.at : 'none'}, a + b = ${step.a >= 0 ? step.a : '-'} and ${step.b >= 0 ? step.b : '-'}, best = ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>The subtracted value should be the smallest one you can afford, and the two added values should be the largest among the rest.</p>
    <p>Trying every index as the subtracted one and keeping the best score covers every valid triple.</p>
  </>} />
}
