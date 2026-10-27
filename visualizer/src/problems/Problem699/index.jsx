import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import SegtreeView from '../../components/shared/SegtreeView'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ground', description: 'Flat ground; nothing is stacked yet.' },
    { id: 'drop', label: 'Drop square', description: 'Land on the tallest surface under the span.' },
    { id: 'done', label: 'Complete', description: 'Return the tallest stack after each drop.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Squares (JSON array of [left, side])',
  url: 'https://leetcode.com/problems/falling-squares/',
  complexity: 'O(n · w) time for this direct version over coordinate width w; a segment tree with lazy assignment gives O(n log w).',
  examples: [
    { label: 'Stacking', input: '[[1,2],[2,3],[6,1]]' },
    { label: 'Overlap', input: '[[100,100],[200,100]]' },
    { label: 'Nested', input: '[[1,2],[1,3]]' },
  ],
}

export default function FallingSquares() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Tallest stack after each drop" length={run.input.length} active={step.index} valueAt={i => step.heights[i] ?? '…'} />
    <output aria-label="Current drop">{step.span ? `Square ${step.index} spans [${step.span[0]}, ${step.span[1]}] · lands at ${step.landed}${step.top == null ? '' : ` · top ${step.top}`}` : 'Ready'}</output>
    {step.seg && <SegtreeView {...step.seg} />}
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Span surface:</strong> the square rests on the highest point of any column it covers, so its bottom is the maximum height in that span.</p>
  </>} />
}
