import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target counts', description: 'Each letter of the target must be supplied its full count.' },
    { id: 'apply', label: 'Apply sticker', description: 'Remove as many needed letters as the sticker provides.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest stickers, or −1.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Stickers and target (JSON object)',
  url: 'https://leetcode.com/problems/stickers-to-spell-word/',
  complexity: 'O(S · ∏(cᵢ + 1)) time for S stickers and letter counts cᵢ of the target, since each state is a vector of remaining counts.',
  examples: [
    { label: 'Two stickers', input: '{"stickers":["with","example","science"],"target":"thehat"}' },
    { label: 'Impossible', input: '{"stickers":["notice","possible"],"target":"basicbasic"}' },
  ],
}

export default function StickersToSpell() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Remaining letters (count to supply)" length={run.letters.length} active={-1}
      valueAt={i => `${run.letters[i]}×${step.remaining[i]}`} roleAt={i => (step.remaining[i] === 0 ? 'written' : '')} />
    <output aria-label="Result">{step.phase === 'done' ? `Result: ${step.result}` : `Stickers used: ${step.used.join(', ') || 'none'}`}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Counts, not just presence:</strong> "{run.input.target}" needs repeated letters, so a state records how many of each remain.</p>
  </>} />
}
