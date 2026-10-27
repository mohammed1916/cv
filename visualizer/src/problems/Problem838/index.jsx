import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Prepare a force array, one entry per domino.' },
    { id: 'right', label: 'Rightward sweep', description: 'Scan left to right: R sets maximum force, L resets it, dots decay it.' },
    { id: 'left', label: 'Leftward sweep', description: 'Scan right to left and subtract the leftward force.' },
    { id: 'done', label: 'Complete', description: 'The sign of each net force gives the final direction.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Dominoes string (JSON)',
  url: 'https://leetcode.com/problems/push-dominoes/',
  complexity: 'O(n) time and O(n) space: two linear sweeps and one pass to build the answer.',
  examples: [
    { label: 'Example 1', input: '"RR.L"' },
    { label: 'Example 2', input: '".L.R...LR..L.."' },
    { label: 'Balanced', input: '"R...L"' },
  ],
}
export default function PushDominoes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Dominoes" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => run.input[i] === '.' ? '' : run.input[i]} />
    <IndexedSequence label="Net force" length={run.input.length} active={step.index} valueAt={i => step.force[i]} roleAt={i => step.force[i] > 0 ? 'right' : step.force[i] < 0 ? 'left' : ''} />
    <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result}` : `Running force f = ${step.f}`}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Why forces:</strong> a domino only cares about the nearest push on each side. The closer push has the larger remaining force, so subtracting the two decayed values picks the nearer one, and a tie cancels out.</p>
    <p>Pushes on {run.input.length} dominoes; positive = R, negative = L.</p>
  </>} />
}
