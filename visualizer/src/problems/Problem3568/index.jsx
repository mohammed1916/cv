import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ClassroomSearchView from './ClassroomSearchView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with classroom (rows of S, L, R, X and dots) and energy',
  url: 'https://leetcode.com/problems/minimum-moves-to-clean-the-classroom/',
  complexity: 'O(m n E 2^L) time and space at worst, for E energy and L litter cells. The official limits are 20 by 20 with 10 litter cells; this view caps at 8 by 8 with 6, and large searches switch to one step per move count.',
  examples: [
    { label: 'Needs a refill', input: '{"classroom":["S.X","R.L"],"energy":2}' },
    { label: 'Walled off', input: '{"classroom":["S.X","..X","XXL"],"energy":9}' },
    { label: 'Runs out of energy', input: '{"classroom":["S...L"],"energy":3}' },
    { label: 'No litter', input: '{"classroom":["S.","R."],"energy":1}' },
  ],
}

export default function MinimumMovesToCleanTheClassroom() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ClassroomSearchView run={run} step={step} />} renderReasoning={() => <>
    <p>The same cell can mean very different things: standing there with no energy and all litter left is not the same as standing there refilled with one piece left. So the search runs over states, made of the cell, the energy left and the set of litter left.</p>
    <p>Every step costs exactly one move, so a queue visits states in order of moves. The first time the last litter goes, no shorter route can exist.</p>
    <p>The small number in a cell is the most energy it has been reached with for the current litter set. Anything arriving later has used at least as many moves, so with no more energy than that it cannot do better and is dropped. That is why the purple numbers only ever go up.</p>
    <p>The student may need to detour: a reset cell can be worth visiting even though it holds no litter, and a cell may be crossed twice when the energy or the litter has changed in between.</p>
  </>} />
}
