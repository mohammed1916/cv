import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at instruction 0 with score 0.' },
    { id: 'add', label: 'Add', description: 'Add the value to the score and move on by one.' },
    { id: 'jump', label: 'Jump', description: 'Move by the value, without changing the score.' },
    { id: 'stop', label: 'Stop', description: 'Out of range or already executed.' },
    { id: 'done', label: 'Complete', description: 'Report the score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with instructions ("add" or "jump") and values',
  url: 'https://leetcode.com/problems/calculate-score-after-performing-instructions/',
  complexity: 'O(n) time and O(n) space, since each instruction runs at most once. The visualization caps the list at 20.',
  examples: [
    { label: 'Example 1', input: '{"instructions":["jump","add","add","jump","add","jump"],"values":[2,1,3,1,-2,-3]}' },
    { label: 'Example 2', input: '{"instructions":["add","jump","add","add"],"values":[3,-2,5,1]}' },
  ],
}

export default function CalculateScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Instructions" length={run.input.instructions.length}
      valueAt={i => `${run.input.instructions[i]} ${run.input.values[i]}`} active={step.i}
      roleAt={i => (step.executed.includes(i) ? 'executed' : '')} />
    <output aria-label="Score">{`Score ${step.score}, next index ${step.i}`}</output>
  </>} renderReasoning={() => <>
    <p>The walk is deterministic, so the first repeated instruction is where it must stop. Each instruction runs at most once.</p>
    <p>Jumps never change the score; only add instructions do.</p>
  </>} />
}
