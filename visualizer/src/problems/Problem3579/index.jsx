import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DPDependencyView from '../../components/shared/DPDependencyView'
import RecordStateTable from '../../components/shared/RecordStateTable'
import PieceAlignmentView from './PieceAlignmentView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with word1 and word2 (same length, lowercase)',
  url: 'https://leetcode.com/problems/minimum-steps-to-convert-string-with-operations/',
  complexity: 'O(n^3) time: n^2 pieces, each priced in O(n). The Counter holds at most 26 by 26 pairs. The visualization takes words up to 12 letters; the official limit is 100.',
  examples: [
    { label: 'Reverse then replace', input: '{"word1":"drawerkit","word2":"rewardkid"}' },
    { label: 'Two swaps', input: '{"word1":"lemonxy","word2":"melonyx"}' },
    { label: 'Already equal', input: '{"word1":"same","word2":"same"}' },
    { label: 'One letter', input: '{"word1":"q","word2":"z"}' },
    { label: 'Single letter', input: '{"word1":"a","word2":"a"}' },
    { label: 'Equal letters in a row', input: '{"word1":"aabb","word2":"bbaa"}' },
    { label: 'Longest allowed words', input: '{"word1":"abcdefghijkl","word2":"lkjihgfedcba"}' },
    { label: 'Long run: 12 letters', input: '{"word1":"mnopqrstuvwx","word2":"xwvutsrqponm"}' },
  ],
}

const COLUMNS = ['start', 'piece', 'as is', 'reversed + 1', 'dp[start] + piece', 'keep']

const sourcesFor = step => {
  if (step.start !== null) return [{ cell: step.start, note: 'before this piece', chosen: step.phase === 'relax' || step.phase === 'trace' }]
  if (step.phase === 'end') return Array.from({ length: step.end }, (_, start) => ({ cell: start, note: 'possible start' }))
  if (step.phase === 'done') return [{ cell: step.plan.at(-1).start, note: 'before the last piece', chosen: true }]
  return []
}

export default function MinimumStepsToConvertString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <div style={{ display: 'grid', gap: 14 }}>
    <PieceAlignmentView run={run} step={step} />
    <DPDependencyView title="Cheapest cost for each prefix" shape="linear" values={step.dp} target={step.end ?? 0}
      sources={sourcesFor(step)}
      recurrence="dp[end] = min over start of dp[start] + min(as is, reversed + 1)" />
    {step.candidates.length > 0 && <RecordStateTable label={`Places the last piece of the first ${step.end} letters can begin`} columns={COLUMNS} rows={step.candidates} activeRow={step.phase === 'relax' ? step.candidates.length - 1 : -1} />}
  </div>} renderReasoning={() => <>
    <p>Pieces do not interact, so the best answer for a prefix is the best answer for some shorter prefix plus the price of one last piece. That is a table over prefix lengths.</p>
    <p>Inside a piece, a reverse is all or nothing and can be done at most once, so there are just two cases to price. After that each position either matches or does not. Two wrong positions that want each other's letters are fixed by one swap, and any other wrong position needs its own replace.</p>
  </>} />
}
