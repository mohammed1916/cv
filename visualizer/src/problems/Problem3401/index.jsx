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
    { label: 'Single gift', input: '{"SecretSanta":[{"giver_id":1,"receiver_id":2,"gift_value":5}]}' },
    { label: 'Equal gift values in two loops', input: '{"SecretSanta":[{"giver_id":1,"receiver_id":2,"gift_value":10},{"giver_id":2,"receiver_id":1,"gift_value":10},{"giver_id":3,"receiver_id":4,"gift_value":10},{"giver_id":4,"receiver_id":3,"gift_value":10}]}' },
    { label: 'Full twelve rows in one loop', input: '{"SecretSanta":[{"giver_id":1,"receiver_id":2,"gift_value":100},{"giver_id":2,"receiver_id":3,"gift_value":101},{"giver_id":3,"receiver_id":4,"gift_value":102},{"giver_id":4,"receiver_id":5,"gift_value":103},{"giver_id":5,"receiver_id":6,"gift_value":104},{"giver_id":6,"receiver_id":7,"gift_value":105},{"giver_id":7,"receiver_id":8,"gift_value":106},{"giver_id":8,"receiver_id":9,"gift_value":107},{"giver_id":9,"receiver_id":10,"gift_value":108},{"giver_id":10,"receiver_id":11,"gift_value":109},{"giver_id":11,"receiver_id":12,"gift_value":110},{"giver_id":12,"receiver_id":1,"gift_value":111}]}' },
    { label: 'Long run: 12 rows', input: '{"SecretSanta":[{"giver_id":1,"receiver_id":2,"gift_value":3},{"giver_id":2,"receiver_id":3,"gift_value":4},{"giver_id":3,"receiver_id":4,"gift_value":5},{"giver_id":4,"receiver_id":1,"gift_value":6},{"giver_id":21,"receiver_id":22,"gift_value":21},{"giver_id":22,"receiver_id":23,"gift_value":22},{"giver_id":23,"receiver_id":24,"gift_value":23},{"giver_id":24,"receiver_id":21,"gift_value":24},{"giver_id":41,"receiver_id":42,"gift_value":29},{"giver_id":42,"receiver_id":43,"gift_value":30},{"giver_id":43,"receiver_id":44,"gift_value":31},{"giver_id":44,"receiver_id":41,"gift_value":32}]}' },
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
