import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start the best distance at zero.' },
    { id: 'corner', label: 'Corner', description: 'Pick one diagonal corner to aim for.' },
    { id: 'walk', label: 'Walk', description: 'Count helpful and hurting moves in the prefix.' },
    { id: 'reach', label: 'Changes', description: 'Spend up to k changes on hurting moves.' },
    { id: 'record', label: 'Record', description: 'Keep the largest distance seen.' },
    { id: 'done', label: 'Result', description: 'Report the best distance.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Moves JSON with s and k',
  url: 'https://leetcode.com/problems/maximum-manhattan-distance-after-k-changes/',
  complexity: 'O(n) time and O(1) extra space for n moves per corner. The visualization caps s at 12 moves.',
  examples: [
    { label: 'Example 1', input: '{"s":"NWSE","k":1}' },
    { label: 'Example 2', input: '{"s":"NSWWEW","k":3}' },
  ],
}

export default function MaximumManhattanDistanceAfterKChanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Moves" length={step.moves.length} valueAt={index => step.moves[index]}
      active={Math.max(0, step.steps - 1)}
      roleAt={index => {
        if (index >= step.steps || !step.corner) return ''
        return step.moves[index] === step.corner[0] || step.moves[index] === step.corner[1] ? 'toward' : 'away'
      }} />
    <p>Corner: {step.corner ? `${step.corner[0]}${step.corner[1]}` : 'none yet'} · Helpful {step.helpful} · Hurting {step.harmful} · Best {step.best}</p>
    <p>Input: {run.input.s} with k = {run.input.k}</p>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each change can turn one hurting move into a helpful one, which moves the reachable point two steps farther from the origin in that corner's direction.</p>
  </>} />
}
