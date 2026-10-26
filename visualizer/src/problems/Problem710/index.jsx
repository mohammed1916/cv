import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Remap table', description: 'Pair blacklisted values below m with allowed values at or above m.' },
    { id: 'draw', label: 'Draw', description: 'Each draw is either allowed or redirected through the table.' },
    { id: 'done', label: 'Complete', description: 'All picks are allowed values.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Setup and draws (JSON object with n, blacklist and draws)',
  url: 'https://leetcode.com/problems/random-pick-with-blacklist/',
  complexity: 'O(b) setup for b blacklisted values and O(1) per pick. The draws are supplied in the input so the run is reproducible.',
  examples: [
    { label: 'Remapped', input: '{"n":4,"blacklist":[2],"draws":[0,1,2]}' },
    { label: 'Several', input: '{"n":8,"blacklist":[1,5,6],"draws":[0,1,2,3,4]}' },
  ],
}

export default function RandomPickBlacklist() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Values 0–${run.input.n - 1} (blacklist marked)`} length={run.input.n} active={step.draw ?? -1}
      valueAt={i => i} roleAt={i => (run.input.blacklist.includes(i) ? 'removed' : '')} />
    <output aria-label="Picks">{step.phase === 'done' ? `Picks: [${step.result.join(', ')}]` : `Remap: ${step.mapping.map(([a, b]) => `${a}→${b}`).join(', ') || 'none'}${step.pick !== null && step.pick !== undefined ? ` · draw ${step.draw} → ${step.pick}` : ''}`}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>No rejection:</strong> rejection sampling can loop; the remap is fixed, so every draw resolves in one lookup.</p>
    <p>Draws are supplied in the input so runs are repeatable; a real pick uses one random integer in [0, {run.input.n - run.input.blacklist.length}).</p>
  </>} />
}
