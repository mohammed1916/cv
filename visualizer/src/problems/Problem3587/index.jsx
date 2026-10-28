import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Find the even and odd positions.' },
    { id: 'even', label: 'Even first', description: 'Cost of the pattern that starts with an even value.' },
    { id: 'odd', label: 'Odd first', description: 'Cost of the pattern that starts with an odd value.' },
    { id: 'done', label: 'Complete', description: 'Report the smaller cost, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 1 to 10 integers from 0 to 99 (JSON)',
  url: 'https://leetcode.com/problems/minimum-adjacent-swaps-to-alternate-parity/',
  complexity: 'O(n) time after counting parities. The visualization caps input at 10 values.',
  examples: [
    { label: 'Example 1', input: '[3,1,2]' },
    { label: 'Example 2', input: '[1,2,4]' },
  ],
}

export default function AlternateParity() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} valueAt={i => run.input[i]}
      roleAt={i => (run.input[i] % 2 === 0 ? 'even' : 'odd')} />
    <output aria-label="Pattern costs">{step.costs.length ? step.costs.map(c => `${c.start}-first: ${c.cost}`).join(', ') : 'Costs not computed yet'}</output>
  </>} renderReasoning={() => <>
    <p>Swaps only exchange an even value with an odd value, so each swap moves exactly one even value by one step. The total movement of the evens equals the number of swaps.</p>
    <p>An alternating arrangement fixes the target position of every even value, so the cost is the sum of how far each even value must move.</p>
  </>} />
}
