import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LockAssignmentView from './LockAssignmentView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with strength (the energy each lock needs)',
  url: 'https://leetcode.com/problems/minimum-time-to-break-locks-ii/',
  complexity: 'O(n^3) time and O(n^2) space, which handles the official limit of 80 locks. This view caps n at 8 so the matrix stays readable.',
  examples: [
    { label: 'Sorting loses', input: '{"strength":[3,7,2,4,5]}' },
    { label: 'Six locks', input: '{"strength":[8,25,5,4,9,18]}' },
    { label: 'One lock', input: '{"strength":[7]}' },
    { label: 'Equal locks', input: '{"strength":[5,5,5]}' },
    { label: 'Largest strength', input: '{"strength":[1000000,1,1000000]}' },
    { label: 'Long run: 8 locks', input: '{"strength":[790,560,508,800,163,759,341,597]}' },
  ],
}

export default function MinimumTimeToBreakLocksII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <LockAssignmentView run={run} step={step} />} renderReasoning={() => <>
    <p>The lock broken while the factor is X takes the strength divided by X, rounded up. Picking an order is the same as giving each lock a different X, so this is an assignment problem on an n by n table of minutes.</p>
    <p>Taking locks from weakest to strongest feels right but can waste slots, because rounding up makes some divisions cost more than they need to. For strengths 2, 3, 4, 5, 7 that order costs 2 + 2 + 2 + 2 + 2 = 10 minutes, while 2, 4, 3, 7, 5 costs 2 + 2 + 1 + 2 + 1 = 8.</p>
    <p>The Hungarian method keeps a price on every lock and every slot, with cost minus both prices never negative. A cell showing tight 0 is one the prices fully pay for. When every lock sits on a tight cell, the total equals the sum of all prices, and no other assignment can cost less than that sum.</p>
    <p>Each new lock searches from its row. If the cheapest slot is taken, the lock holding it joins the search, and prices shift just enough to bring one more cell to 0, until a free slot is reached. Everyone on that chain then moves over by one.</p>
  </>} />
}
