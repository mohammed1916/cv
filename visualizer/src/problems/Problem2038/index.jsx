import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2038',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Line of A and B pieces (JSON)',
  url: 'https://leetcode.com/problems/remove-colored-pieces-if-both-neighbors-are-the-same-color/',
  complexity: 'O(n) time: each interior piece is checked against its neighbours once.',
  examples: [
    { label: 'Bob ahead', input: '{"colors":"BBBABBB"}' },
    { label: 'Alice plays', input: '{"colors":"AAAABA"}' },
    { label: 'Tie', input: '{"colors":"ABAB"}' },
  ],
}

export default function RemoveColoredPieces() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { colors, l, r, index, alice, bob } = step.snapshot
    return <>
      <IndexedSequence label="Pieces" length={colors.length} valueAt={i => colors[i]} active={index}
        roleAt={i => (i === l && l >= 0 ? 'l' : '') + (i === index && index >= 0 ? ' middle' : '') + (i === r && r < colors.length && index >= 0 ? ' r' : '')} />
      <p>Alice moves: <strong>{alice}</strong> · Bob moves: <strong>{bob}</strong>.</p>
    </>
  }} renderReasoning={() => <p>A piece can be removed only when it and both neighbours share its colour, so each such middle piece is one move for its owner, and the player with more moves wins.</p>} />
}
