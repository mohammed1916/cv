import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { jumpTarget } from './algorithm'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Last index', description: 'The end is reached from itself.' },
    { id: 'fill', label: 'Decide an index', description: 'Look up where its odd and even jumps land, and reuse those answers.' },
    { id: 'done', label: 'Count', description: 'Count the starts whose first jump is odd and reaches the end.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON)',
  url: 'https://leetcode.com/problems/odd-even-jump/',
  complexity: 'O(n^2) time with the scan in this visualization (O(n log n) with sorting). The visualization caps input at 20 values.',
  examples: [
    { label: 'Five values, alternating', input: '[6,2,9,4,1]' },
    { label: 'Ties in value', input: '[3,3,1,2,3]' },
    { label: 'Single element', input: '[7]' },
    { label: 'Equal values give tied jumps', input: '[5,5,5,5]' },
    { label: 'Extreme values at the limit', input: '[1000,-1000,1000,-1000]' },
    { label: 'Long run: 20 items', input: '[-85,320,-114,-414,922,-576,-668,-602,-184,-994,522,58,733,-671,-92,739,-122,133,219,-56]' },
  ],
}

export default function OddEvenJump() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} active={step.index ?? -1} valueAt={i => run.input[i]}
      roleAt={i => (step.canOdd[i] ? 'read' : '')} />
    <IndexedSequence label="Starts that can finish with an odd jump" length={run.input.length} active={step.index ?? -1}
      valueAt={i => (step.canOdd[i] ? 'yes' : 'no')} />
    <GraphTraversalView title="Jump graph: odd and even jumps from each index" n={run.input.length}
      edges={run.input.flatMap((_, i) => [jumpTarget(run.input, i, true), jumpTarget(run.input, i, false)].filter(j => j !== -1).map(j => [i, j]))}
      directed current={step.index ?? null} done={run.input.map((_, i) => i).filter(i => step.canOdd[i])}
      tags={Object.fromEntries(run.input.map((_, i) => [i, `${step.canOdd[i] ? 'odd: yes' : 'odd: no'}`]))} showFrontier={false} />
    <output aria-label="Message">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each index has two answers: one for when its next jump is odd, one for when it is even. An odd jump from i leads to a state that asks for the even answer, and vice versa.</p>
    <p>Computing from right to left means every target is already decided when it is needed.</p>
  </>} />
}
