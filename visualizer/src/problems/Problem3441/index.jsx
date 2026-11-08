import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'fill', label: 'Fill', description: 'Store the cheapest finish from each index.' },
    { id: 'walk', label: 'Walk', description: 'Read the stored choices from the start.' },
    { id: 'done', label: 'Result', description: 'Report the caption and its cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with caption (lowercase letters, 1 to 12)',
  url: 'https://leetcode.com/problems/minimum-cost-good-caption/',
  complexity: 'O(n * 26 * 3) states with a 26-letter choice each. The visualization caps the caption at 12 letters.',
  examples: [
    { label: 'Invented mix', input: '{"caption":"abc"}' },
    { label: 'Two letters', input: '{"caption":"aab"}' },
    { label: 'Shortest caption: three letters', input: '{"caption":"qqq"}' },
    { label: 'Repeated letter run', input: '{"caption":"aaaa"}' },
    { label: 'Longest caption', input: '{"caption":"abcdefghijkl"}' },
    { label: 'Long run: 12 letters', input: '{"caption":"cdzzifcduhmd"}' },
  ],
}

export default function MinimumCostGoodCaption() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="caption" length={run.input.caption.length} valueAt={i => run.input.caption[i]} active={step.at}
      roleAt={i => (step.text && i < step.text.length ? 'set' : '')} />
    <output aria-label="Built caption">{`caption so far = ${step.text || '(not yet)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each run of letters must reach three in a row, and a run can only end once it has reached three.</p>
    <p>Filling from the right stores the cheapest finish for each state, so the walk from the start never has to search again.</p>
  </>} />
}
