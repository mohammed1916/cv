import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Step 0 costs nothing to reach.' },
    { id: 'step', label: 'Fill step', description: 'Choose the cheapest jump of length 1, 2 or 3 into this step.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum cost to reach step n.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and costs (JSON), for example {"n":4,"costs":[1,2,3,4]}',
  url: 'https://leetcode.com/problems/climbing-stairs-ii/',
  complexity: 'O(n) time and O(n) space. The visualization caps n at 12.',
  examples: [
    { label: 'Four costs, one cheap', input: '{"n":4,"costs":[3,9,2,6]}' },
    { label: 'Single heavy cost', input: '{"n":1,"costs":[10000]}' },
    { label: 'Three unit costs', input: '{"n":3,"costs":[1,1,1]}' },
    { label: 'Single stair', input: '{"n":1,"costs":[7]}' },
    { label: 'Equal costs tie', input: '{"n":5,"costs":[2,2,2,2,2]}' },
    { label: 'Largest costs allowed', input: '{"n":12,"costs":[10000,1,10000,1,10000,1,10000,1,10000,1,10000,1]}' },
    { label: 'Long run: 12 stairs', input: '{"n":12,"costs":[7753,2168,8555,8066,8525,220,7599,3878,2833,2576,1795,7530]}' },
  ],
}

export default function ClimbingStairsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="dp by step" length={step.dp.length} valueAt={index => (step.dp[index] === null ? '-' : step.dp[index])} active={step.step} />
    <output aria-label="Jump">{step.from === null ? `Minimum cost so far at step ${step.step}` : `Step ${step.step} is reached from step ${step.from}`}</output>
  </>} renderReasoning={() => <>
    <p>The cheapest way to reach a step is the cheapest way to reach one of the three steps before it, plus the jump cost into this step.</p>
    <p>Each jump of length d pays the destination step cost plus d squared, so long jumps are penalised.</p>
  </>} />
}
