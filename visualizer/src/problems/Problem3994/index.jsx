import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BandView from './BandView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3994',
  phases: [
    { id: 'start', label: 'Setup', description: 'Zero the seen counts for the three bands.' },
    { id: 'classify', label: 'Band', description: 'Find which band this value belongs to.' },
    { id: 'count', label: 'Cross', description: 'Count earlier values that must pass this one.' },
    { id: 'record', label: 'Record', description: 'Add this value to its band count.' },
    { id: 'done', label: 'Result', description: 'Report the swap total modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, a and b (e.g. {"nums":[5,1,8,3,9,2],"a":3,"b":6})',
  url: 'https://leetcode.com/problems/minimum-adjacent-swaps-to-partition-array/',
  complexity: 'O(n) time and O(1) extra space, since only three band counters are kept. The visualization caps nums at 10 values of at most 20.',
  examples: [
    { label: 'Mixed bands', input: '{"nums":[5,1,8,3,9,2],"a":3,"b":6}' },
    { label: 'Two in order', input: '{"nums":[7,7,2,9],"a":5,"b":8}' },
  ],
}

export default function MinimumAdjacentSwaps() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <BandView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Values inside a band may end in any order, so only pairs that sit in the wrong band order cost a swap.</p>
    </>} />
}
