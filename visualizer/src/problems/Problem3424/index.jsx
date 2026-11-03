import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the two arrays.' },
    { id: 'direct', label: 'Direct', description: 'Adjust each position in place.' },
    { id: 'sort', label: 'Sort', description: 'Line up the values in order.' },
    { id: 'match', label: 'Pair', description: 'Pair equal ranks and total the gaps.' },
    { id: 'choose', label: 'Compare', description: 'Weigh one split against the direct route.' },
    { id: 'done', label: 'Result', description: 'The cheaper route is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr, brr and k',
  url: 'https://leetcode.com/problems/minimum-cost-to-make-arrays-identical/description/',
  complexity: 'O(n log n) for the sorting step. The visualization caps n at 8.',
  examples: [
    { label: 'Example', input: '{"arr":[4,-1,2],"brr":[0,3,-2],"k":1}' },
    { label: 'Already equal', input: '{"arr":[5,5],"brr":[5,5],"k":3}' },
  ],
}

export default function MinimumCostIdenticalArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arr" length={run.input.arr.length} valueAt={i => (step.a ?? run.input.arr)[i]} active={step.at} roleAt={() => ''} />
    <IndexedSequence label="brr" length={run.input.brr.length} valueAt={i => (step.b ?? run.input.brr)[i]} active={step.at} roleAt={() => ''} />
    <output aria-label="Cost so far">{`Split cost k = ${run.input.k} · ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A single split-and-rearrange operation can realize any permutation of arr, because singletons may be reordered freely.</p>
    <p>Adjusting an element costs its distance to the target, and sorted pairing minimizes the total distance over all permutations, so one split plus sorted pairing is the best rearranged route.</p>
  </>} />
}
