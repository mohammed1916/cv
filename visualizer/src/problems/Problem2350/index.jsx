import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the first block with no faces seen.' },
    { id: 'roll', label: 'Roll', description: 'Add this roll to the current block.' },
    { id: 'block', label: 'Block done', description: 'Every face has appeared, so a block closes and the count grows.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest impossible length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rolls (values 1 to k) and k (1 to 4)',
  url: 'https://leetcode.com/problems/shortest-impossible-sequence-of-rolls/',
  complexity: 'O(n) time with a set of at most k faces. The visualization caps input at 10 rolls.',
  examples: [
    { label: 'Example 1', input: '{"rolls":[4,2,1,2,3,3,2,4,1],"k":4}' },
    { label: 'Example 2', input: '{"rolls":[1,1,2,2],"k":2}' },
  ],
}

export default function ShortestImpossibleRolls() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Rolls" length={run.input.rolls.length} valueAt={i => run.input.rolls[i]} active={step.index} roleAt={i => (i < step.index ? 'past' : '')} />
    <output aria-label="Faces in current block">{`Faces in current block: ${step.seen.join(', ') || 'none'}. Complete blocks: ${step.blocks}`}</output>
  </>} renderReasoning={() => <>
    <p>Every sequence of length blocks+1 that uses each face in turn must skip some face in the last incomplete block, so the answer is one more than the number of complete blocks.</p>
    <p>Cutting greedily at the earliest point where all faces have appeared gives the most blocks, which is what makes the bound tight.</p>
  </>} />
}
