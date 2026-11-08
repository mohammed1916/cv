import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Prepare the set of unusable numbers.' },
    { id: 'poison', label: 'Find bad cards', description: 'A card with equal faces makes its number bad.' },
    { id: 'candidate', label: 'Scan faces', description: 'Take the smallest face that is not bad.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest good number, or 0.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object with fronts and backs (JSON)',
  url: 'https://leetcode.com/problems/card-flipping-game/',
  complexity: 'O(n) time and O(n) space for the bad set.',
  examples: [
    { label: 'Own case 1', input: '{"fronts":[2,3,5,5,8],"backs":[2,4,5,2,4]}' },
    { label: 'Single card', input: '{"fronts": [1], "backs": [1]}' },
    { label: 'Pair', input: '{"fronts": [1,1], "backs": [2,2]}' },
    { label: 'Single card', input: '{"fronts":[1],"backs":[2]}' },
    { label: 'Equal faces', input: '{"fronts":[3,3],"backs":[3,3]}' },
    { label: 'Largest faces', input: '{"fronts":[2000,1999],"backs":[1999,2000]}' },
    { label: 'Long run: 50 cards', input: '{"fronts":[3,2,5,4,5,4,4,5,6,1,2,6,3,3,1,2,4,4,6,3,6,3,2,2,5,3,6,3,1,2,4,6,5,3,4,3,4,4,5,3,1,4,6,3,3,3,5,3,1,5],"backs":[1,2,4,1,2,4,3,3,4,5,1,2,3,5,1,2,5,3,5,2,3,5,3,4,3,6,2,4,3,1,1,4,6,3,6,6,3,5,1,6,4,1,2,4,1,3,1,2,3,2]}' },
  ],
}
export default function CardFlippingGame() {
  const inPoison = step => step.phase === 'poison'
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Fronts" length={run.input.fronts.length} active={inPoison(step) ? step.index : -1} valueAt={i => run.input.fronts[i]}
      roleAt={i => run.input.fronts[i] === run.input.backs[i] ? 'same' : ''} />
    <IndexedSequence label="Backs" length={run.input.backs.length} active={inPoison(step) ? step.index : -1} valueAt={i => run.input.backs[i]} />
    <IndexedSequence label="Faces scanned (fronts then backs)" length={run.all.length} active={step.phase === 'candidate' ? step.index : -1} valueAt={i => run.all[i]}
      roleAt={i => step.bad.includes(run.all[i]) ? 'bad' : ''} />
    <output aria-label="Bad numbers and best">Bad numbers: {step.bad.length ? step.bad.join(', ') : 'none'} | best: {step.best || 'none'}</output>
  </>} renderReasoning={() => <>
    <p>We may flip any cards. A card showing x on both sides keeps x on the front no matter what, so x can never be the number we choose to hide.</p>
    <p>Any other number appears face-down on some card, and flipping the others can always keep it off every front.</p>
  </>} />
}
