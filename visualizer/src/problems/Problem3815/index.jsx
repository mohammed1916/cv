import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3815,
  phases: [
    { id: 'add', label: 'Add', description: 'Store or replace the user bid on the item.' },
    { id: 'update', label: 'Update', description: 'Change a bid that already exists.' },
    { id: 'remove', label: 'Remove', description: 'Delete the user bid on the item.' },
    { id: 'query', label: 'Highest', description: 'Compare amounts, then user ids, to find the winner.' },
    { id: 'done', label: 'Result', description: 'All queries have been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: a list such as ["addBid", user, item, amount]',
  url: 'https://leetcode.com/problems/design-auction-system/',
  complexity: 'Each query scans one item here; a per-item ordered structure would answer queries faster.',
  examples: [
    { label: 'Tie on amount', input: '{"ops":[["addBid",1,1,5],["addBid",2,1,7],["addBid",3,1,7],["getHighestBidder",1],["updateBid",1,1,9],["getHighestBidder",1],["removeBid",3,1],["getHighestBidder",1],["getHighestBidder",2]]}' },
    { label: 'One bid query', input: '{"ops":[["addBid",1,1,5],["getHighestBidder",1]]}' },
    { label: 'Equal amounts, later bidder removed', input: '{"ops":[["addBid",1,1,6],["addBid",2,1,6],["removeBid",2,1],["getHighestBidder",1]]}' },
    { label: 'Largest identifiers and amounts', input: '{"ops":[["addBid",30,30,30],["addBid",29,30,30],["getHighestBidder",30]]}' },
    { label: 'Long run: 12 operations', input: '{"ops":[["addBid",1,1,4],["addBid",2,1,9],["addBid",3,1,7],["getHighestBidder",1],["updateBid",1,1,12],["getHighestBidder",1],["addBid",4,1,6],["removeBid",2,1],["getHighestBidder",1],["updateBid",3,1,30],["getHighestBidder",1],["getHighestBidder",1]]}' },
  ],
}

export default function DesignAuctionSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Operations">{run.input.ops.map((op, i) => <li key={i} data-current={step.at === i ? 'yes' : undefined}>
      {op.join(', ')}{step.at >= i && run.result[i] !== null ? ` → ${run.result[i]}` : ''}</li>)}</ol>
    <table aria-label="Bids on the focused item">
      <thead><tr><th>user</th><th>amount</th></tr></thead>
      <tbody>{step.bids.map(([user, amount]) => <tr key={user}><td>{user}</td><td>{amount}</td></tr>)}</tbody>
    </table>
    <output aria-label="Current operation">{step.item !== null && step.item !== undefined ? `item ${step.item}: ${step.message}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>A map keyed by user makes a replacement, update or removal one step, because one user has at most one bid per item.</p>
    <p>The highest bidder is the largest amount, with ties going to the larger user id, which is exactly the order of the sorted bid list shown.</p>
  </>} />
}
