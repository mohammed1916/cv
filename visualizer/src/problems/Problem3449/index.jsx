import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Enter', description: 'The first move lands on index 0.' },
    { id: 'move', label: 'Walk', description: 'Step to a neighbour and add its points.' },
    { id: 'leaf', label: 'Score', description: 'Record the minimum of this walk.' },
    { id: 'done', label: 'Result', description: 'Report the best minimum found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with points (1 to 4 integers) and m (1 to 6)',
  url: 'https://leetcode.com/problems/maximize-the-minimum-game-score/',
  complexity: 'Exhaustive over walks: about 2^(m-1) walks on a board of at most 4 cells, so the visualization caps the sizes.',
  examples: [
    { label: 'Invented pair', input: '{"points":[1,5],"m":3}' },
    { label: 'Three equal cells', input: '{"points":[2,2,2],"m":3}' },
    { label: 'Single point', input: '{"points":[4],"m":1}' },
    { label: 'Equal cells tie', input: '{"points":[5,5],"m":1}' },
    { label: 'Extremes, m six', input: '{"points":[9,1,9,1],"m":6}' },
    { label: 'Long run: 4 points', input: '{"points":[1,7,5,3],"m":5}' },
  ],
}

export default function MaximizeTheMinimumGameScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="gameScore" length={run.input.points.length} valueAt={i => step.scores[i]} active={step.at}
      roleAt={i => (i === step.at ? 'visit' : '')} />
    <output aria-label="Best minimum">{`best so far = ${step.best < 0 ? 'none' : step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Every move adds points to the cell it lands on, so a walk is scored by the smallest total left on the board.</p>
    <p>Moves never reduce a total, so the walks that use every move are enough to compare.</p>
  </>} />
}
