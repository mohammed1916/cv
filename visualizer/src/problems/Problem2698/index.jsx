import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a zero total.' },
    { id: 'check', label: 'Check i', description: 'Test whether the digits of i squared can be cut into pieces summing to i.' },
    { id: 'add', label: 'Add square', description: 'The square counts, so add it to the total.' },
    { id: 'done', label: 'Complete', description: 'Report the punishment number.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"n": value}',
  url: 'https://leetcode.com/problems/find-the-punishment-number-of-an-integer/',
  complexity: 'Each square has at most 2^(digits-1) cut patterns, so the search is small for n up to 1000. The visualization caps n at 100.',
  examples: [
    { label: 'Example 1', input: '{"n":10}' },
    { label: 'Example 2', input: '{"n":37}' },
  ],
}

export default function PunishmentNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Candidates i" length={run.input.n} valueAt={i => i + 1} active={(step.i ?? 0) - 1} roleAt={i => run.counted.includes(i + 1) ? 'counted' : ''} />
    <output aria-label="Total">{`Square ${step.square ?? '-'} for i = ${step.i ?? '-'}; running total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Cutting the digits of i squared into pieces is a search: after each piece, the remaining target shrinks by that piece's value.</p>
    <p>A piece that already exceeds the target ends that branch, so most cut patterns are never tried.</p>
  </>} />
}
