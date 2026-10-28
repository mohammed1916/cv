import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Losses', description: 'Add up the net loss of every transaction.' },
    { id: 'candidate', label: 'Last transaction', description: 'Consider this transaction done last, after every other loss is paid.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum money required.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with transactions: 1 to 8 [cost, cashback] pairs (cost 1 to 20, cashback 0 to 20)',
  url: 'https://leetcode.com/problems/minimum-money-required-before-transactions/',
  complexity: 'O(n) time for n transactions. The visualization caps transactions at 8.',
  examples: [
    { label: 'Example 1', input: '{"transactions":[[2,1],[5,0],[4,2]]}' },
    { label: 'Example 2', input: '{"transactions":[[3,0],[0,3]]}' },
  ],
}

export default function MinimumMoney() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Transactions [cost, cashback]" length={run.input.transactions.length} valueAt={index => `[${run.input.transactions[index].join(', ')}]`} active={step.index} />
    <output aria-label="Money">{`Total loss ${step.totalLoss}; best so far ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The money must work in any order, so the worst order decides. Each transaction is imagined as the last one, after every other loss has been paid.</p>
    <p>Its own cost must be affordable at that point, which gives the total loss minus its own loss plus its cost; the answer is the largest of these.</p>
  </>} />
}
