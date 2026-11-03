import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MoveWalkView from './MoveWalkView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Add up the fixed moves and count the underscores.' },
    { id: 'sign', label: 'Direction', description: 'Pick the side of zero that every underscore should push toward.' },
    { id: 'walk', label: 'Walk', description: 'Replay the moves with underscores resolved.' },
    { id: 'done', label: 'Result', description: 'Report the Manhattan distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Move string using U, D, L, R and _ (e.g. L_R_U)',
  url: 'https://leetcode.com/problems/maximum-manhattan-distance-after-all-moves/',
  complexity: 'O(length) time and O(1) extra space. The visual caps the string at 30 characters.',
  examples: [
    { label: 'Two blanks', input: 'L_R_U' },
    { label: 'Leading blanks', input: '__LLU' },
  ],
}

export default function MaximumManhattanDistanceAfterAllMoves() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MoveWalkView run={run} step={step} />} renderReasoning={({ step }) => (
    <p>Every underscore can add one to the distance from the origin, but only if it moves away from zero. Replaying with the chosen direction keeps every blank useful. {step.message}</p>
  )} />
}
