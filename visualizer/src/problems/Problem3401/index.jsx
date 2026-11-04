import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ChainGraphView from './ChainGraphView'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const table = rows => JSON.stringify({ SecretSanta: rows.map(([giver_id, receiver_id, gift_value]) => ({ giver_id, receiver_id, gift_value })) })

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with SecretSanta, a list of rows with giver_id, receiver_id and gift_value',
  url: 'https://leetcode.com/problems/find-circular-gift-exchange-chains/',
  complexity: 'With g gifts, each of the g walks takes at most g hops, so O(g²) time and rows. The visualization draws at most 12 gifts.',
  examples: [
    { label: 'Loop of four and a swap', input: table([[3, 8, 15], [8, 6, 10], [6, 11, 5], [11, 3, 12], [20, 21, 9], [21, 20, 16]]) },
    { label: 'Equal loops merge', input: table([[1, 2, 10], [2, 1, 30], [5, 6, 25], [6, 5, 15]]) },
    { label: 'Open line is ignored', input: table([[31, 32, 8], [32, 33, 4], [40, 41, 7], [41, 40, 2]]) },
    { label: 'No loop', input: table([[9, 4, 50]]) },
  ],
}

export default function FindCircularGiftExchangeChains() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ChainGraphView run={run} step={step} />} renderReasoning={() => <>
    <p>Each employee gives at most once and receives at most once, so following gifts can never branch. The arrows split into separate loops and open lines.</p>
    <p>The recursive query starts a walk from every row and follows the next gift. A walk that returns to its own start has traced a complete loop, carrying its length and total.</p>
    <p>A loop of L people is found L times, once from each member, all with the same length and total. DISTINCT removes those repeats, and it also merges different loops that happen to match, which the task asks for.</p>
    <p>chain_id is the row number after sorting, not an employee id.</p>
  </>} />
}
