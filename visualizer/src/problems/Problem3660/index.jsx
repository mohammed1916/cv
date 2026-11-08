import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin a search from this index.' },
    { id: 'visit', label: 'Visit', description: 'A legal jump reaches a new index.' },
    { id: 'record', label: 'Record', description: 'Store the best value reached from this start.' },
    { id: 'done', label: 'Result', description: 'All starts are answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums',
  url: 'https://leetcode.com/problems/jump-game-ix/',
  complexity: 'O(n^2) time for this breadth-first search per start; the visualization caps n at 10.',
  examples: [
    { label: 'Example', input: '{"nums":[2,7,3,5]}' },
    { label: 'Peak', input: '{"nums":[6,1,4]}' },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[9,9,9]}' },
    { label: 'Largest values', input: '{"nums":[99,1,99,1,99,1,99,1,99,1]}' },
    { label: 'Long run: 10 values', input: '{"nums":[71,45,63,46,86,90,11,73,27,65]}' },
  ],
}

export default function JumpGameIX() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.at >= 0 ? step.at : -1}
      roleAt={i => (step.seen && step.seen.includes(i) ? 'window' : '')} />
    <output aria-label="Reachable state">{`from ${step.start >= 0 ? step.start : 'none'}, best ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>A jump is allowed right only to a smaller value and left only to a larger one. Following chains of jumps is a graph search.</p>
    <p>Each start index runs its own breadth-first search, and the largest value seen is that index's answer.</p>
  </>} />
}
