import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Starts', description: 'Try each index where Alice can stand.' },
    { id: 'try', label: 'Try', description: 'Price the ones and created ones for this start.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest start.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (0/1 list), k and maxChanges',
  url: 'https://leetcode.com/problems/minimum-moves-to-pick-k-ones/',
  complexity: 'O(n^2 log n) time for the visualization; it is intended for small arrays.',
  examples: [
    { label: 'Invented example', input: '{"nums":[0,1,1,0,1],"k":3,"maxChanges":0}' },
    { label: 'Created ones', input: '{"nums":[0,0,0,0,0],"k":3,"maxChanges":3}' },
    { label: "Two values", input: "{\"nums\":[1,0],\"k\":1,\"maxChanges\":0}" },
    { label: "Equal neighbours with no changes", input: "{\"nums\":[1,1,1],\"k\":3,\"maxChanges\":0}" },
    { label: "All zeros with the largest budget", input: "{\"nums\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"k\":16,\"maxChanges\":16}" },
    { label: "Long run: 16 values", input: "{\"nums\":[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],\"k\":13,\"maxChanges\":5}" },
  ],
}

export default function MinimumMovesToPickKOnes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at ?? -1}
      roleAt={i => (i === step.at ? 'start' : '')} />
    <output aria-label="Best cost so far">{`start ${step.at >= 0 ? step.at : 'none'}, cost ${step.cost === Infinity ? 'impossible' : step.cost ?? '-'}, best ${step.best === Infinity ? 'none' : step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A one at distance d can be carried to Alice in d moves. An empty cell needs one creation move before the same walk, so it costs d plus 1.</p>
    <p>For each start index, take the cheapest mix of ones and created ones, then keep the smallest total.</p>
  </>} />
}
