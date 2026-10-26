import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Create the empty lead table.' },
    { id: 'base', label: 'Single pile', description: 'A one-pile row gives the mover that pile.' },
    { id: 'fill', label: 'Fill interval', description: 'Take the better of left or right pile minus the opponent best lead.' },
    { id: 'done', label: 'Complete', description: 'Alex wins when the full-row lead is positive.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Piles (JSON, even length ≤ 20, odd total)',
  url: 'https://leetcode.com/problems/stone-game/',
  complexity: 'O(n^2) time and space for interval DP. (Alex in fact always wins, but the DP proves it.)',
  examples: [
    { label: 'Official', input: '[5,3,4,5]' },
    { label: 'Six piles', input: '[3,7,2,3,8,1]' },
    { label: 'Two piles', input: '[1,2]' },
  ],
}

export default function StoneGame() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const n = run.input.length
      const cell = step.cell
      return <>
        <IndexedSequence label="Piles" length={n} valueAt={i => run.input[i]} active={cell ? cell.row : -1}
          roleAt={i => (cell && i > cell.row && i <= cell.column ? 'range' : '')} />
        <DPTable title="dp[i][j] = best lead on piles i..j" values={step.table} activeCell={cell} relatedCells={step.related} />
        {step.phase === 'done' && <output aria-label="Result">Alex wins: {String(run.result)}</output>}
      </>
    }}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p><strong>Why subtract?</strong> After the mover takes a pile, the opponent becomes the mover on the smaller row and gets dp of that row as their lead, which counts against us.</p>
      <p>Because the total is odd there are no ties, so a positive lead for Alex means Alex wins.</p>
    </>} />
}
