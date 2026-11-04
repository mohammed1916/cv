import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import PathSearchView from './PathSearchView'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function SequentialGridPathCover() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PathSearchView run={run} step={step} />} renderReasoning={() => <>
    <p>A numbered cell can only be entered when it is the number needed next, so a walk that reaches full length has already met 1 to k in order. Only one thing has to be tracked: the next number.</p>
    <p>That number belongs to the recursive call. When the search steps back past a numbered cell the number needed goes back too, which is why the rail can move left.</p>
    <p>Off-grid moves are not drawn. On a 5 by 5 board the search is still small enough to run to the end, because the walk may not revisit a cell.</p>
  </>} />
}
