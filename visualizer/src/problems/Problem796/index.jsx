import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Lengths', description: 'Rotations need equal lengths.' },
    { id: 'try', label: 'Try a shift', description: 'Move the first characters to the end.' },
    { id: 'match', label: 'Match', description: 'The rotation equals the goal.' },
    { id: 'done', label: 'Complete', description: 'Return the verdict.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 's and goal (JSON object)',
  url: 'https://leetcode.com/problems/rotate-string/',
  complexity: 'O(n^2) for this direct version; checking whether goal appears inside s + s runs in O(n).',
  examples: [
    { label: 'Shift', input: '{"s":"lunch","goal":"chlun"}' },
    { label: 'Miss', input: '{"s":"abcde","goal":"abced"}' },
  ],
}

export default function RotateString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label={`Rotations of "${run.input.s}" compared with "${run.input.goal}"`} columns={['shift', 'rotation', 'equals goal?']}
      rows={run.input.s.length === run.input.goal.length ? Array.from({ length: run.input.s.length }, (_, k) => ({ shift: k, rotation: run.input.s.slice(k) + run.input.s.slice(0, k), 'equals goal?': (step.shift >= k || step.phase === 'done') && (run.input.s.slice(k) + run.input.s.slice(0, k)) === run.input.goal ? 'yes' : (step.shift >= k ? 'no' : '') })) : []}
      activeRow={step.shift} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A rotation moves a prefix to the end. Checking each shift from 0 to n-1 covers every rotation, and lengths must match first.</p>
  </>} />
}
