import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreePairView from './TreePairView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1214',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with root1, root2 (level-order arrays with null) and target',
  url: 'https://leetcode.com/problems/two-sum-bsts/description/',
  complexity: 'O(n + m) time and O(n + m) space for trees with n and m nodes. The visualization caps each tree at 15 entries in its level-order array; the draft does not state an exact official bound.',
  examples: [
    { label: 'Pair found', input: '{"root1":[5,3,8],"root2":[2,1,6],"target":11}' },
    { label: 'No pair', input: '{"root1":[5,3,8],"root2":[2,1,6],"target":20}' },
    { label: 'Single nodes', input: '{"root1":[4],"root2":[4],"target":8}' },
    { label: 'Single node each', input: '{\"root1\":[1],\"root2\":[2],\"target\":3}' },
    { label: 'Equal values pair across trees', input: '{\"root1\":[4],\"root2\":[4],\"target\":8}' },
    { label: 'No pair reaches the target', input: '{\"root1\":[5,3,8],\"root2\":[2,1,6],\"target\":100}' },
    { label: 'Long run: two full trees of fifteen nodes', input: '{\"root1\":[8,4,12,2,6,10,14,1,3,5,7,9,11,13,15],\"root2\":[16,8,24,4,12,20,28,2,6,10,14,18,22,26,30],\"target\":31}' },
  ],
}

export default function Problem1214TwoSumBSTs() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TreePairView run={run} step={step} />}
      renderReasoning={() => (
        <p>Each tree is walked in order, so both lists are sorted. Moving i up when the sum is too small and j down when it is too large checks every candidate pair without repeats.</p>
      )}
    />
  )
}
