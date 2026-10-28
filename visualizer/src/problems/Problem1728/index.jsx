import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Finished', description: 'Mark the states that are already decided.' },
    { id: 'layer', label: 'Propagate', description: 'Decide states whose moves all lead to decided outcomes.' },
    { id: 'done', label: 'Complete', description: 'Report whether the mouse wins from the start.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with grid, catJump and mouseJump, for example {"grid": ["M.C...F"], "catJump": 1, "mouseJump": 4}',
  url: 'https://leetcode.com/problems/cat-and-mouse-ii/',
  complexity: 'O((rows * cols)^2 * moves) states. The visualization caps the board at 8 by 8.',
  examples: [
    { label: 'Example 1', input: '{"grid":["####F","#C...","M...."],"catJump":1,"mouseJump":2}' },
    { label: 'Example 2', input: '{"grid":["M.C...F"],"catJump":1,"mouseJump":4}' },
    { label: 'Example 3', input: '{"grid":["M.C...F"],"catJump":1,"mouseJump":3}' },
  ],
}

export default function CatAndMouse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <pre aria-label="Board">{run.input.grid.join('\n')}</pre>
    <output aria-label="Decided states">{`Decided states: ${step.decided}, after ${step.depth} moves`}</output>
  </>} renderReasoning={() => <>
    <p>A state is a mouse cell, a cat cell and whose turn it is. Work backwards from finished states: a mouse-turn state is won by the mouse if some move reaches a mouse win, and a cat-turn state is won by the mouse only if every cat move does.</p>
    <p>Any state still undecided at the end is a draw, which counts as a cat win.</p>
  </>} />
}
