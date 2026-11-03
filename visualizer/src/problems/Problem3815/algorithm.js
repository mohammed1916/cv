const NAMES = ['addBid', 'updateBid', 'removeBid', 'getHighestBidder']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.ops)) throw new Error('Use an object with an ops list.')
  if (input.ops.length < 1 || input.ops.length > 12) throw new Error('ops has 1 to 12 operations.')
  for (const op of input.ops) {
    if (!Array.isArray(op) || !NAMES.includes(op[0])) throw new Error('Each operation is addBid, updateBid, removeBid or getHighestBidder with its arguments.')
    const args = op.slice(1)
    const want = op[0] === 'getHighestBidder' ? 1 : op[0] === 'removeBid' ? 2 : 3
    if (args.length !== want || !args.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error(`${op[0]} takes ${want} integers from 1 to 30.`)
  }
  return { ops: input.ops }
}

// Bids for one item, ordered by highest amount then highest user id.
function ranked(bids) {
  return [...bids.entries()].map(([user, amount]) => [user, amount]).sort((a, b) => b[1] - a[1] || b[0] - a[0])
}

export function buildTrace({ ops }) {
  const bids = new Map()
  const frames = []
  const results = []
  ops.forEach((op, k) => {
    const [name, ...args] = op
    let result = null
    let phase
    let message
    let item
    if (name === 'addBid') {
      const [user, itemId, amount] = args
      item = itemId
      if (!bids.has(itemId)) bids.set(itemId, new Map())
      const old = bids.get(itemId).get(user)
      bids.get(itemId).set(user, amount)
      phase = 'add'
      message = old === undefined ? `User ${user} bids ${amount} on item ${itemId}.` : `User ${user} replaces the bid ${old} with ${amount} on item ${itemId}.`
    } else if (name === 'updateBid') {
      const [user, itemId, amount] = args
      item = itemId
      if (!bids.has(itemId) || !bids.get(itemId).has(user)) throw new Error(`updateBid needs an existing bid from user ${user} on item ${itemId}.`)
      bids.get(itemId).set(user, amount)
      phase = 'update'
      message = `User ${user} changes the bid on item ${itemId} to ${amount}.`
    } else if (name === 'removeBid') {
      const [user, itemId] = args
      item = itemId
      if (!bids.has(itemId) || !bids.get(itemId).has(user)) throw new Error(`removeBid needs an existing bid from user ${user} on item ${itemId}.`)
      bids.get(itemId).delete(user)
      phase = 'remove'
      message = `User ${user}'s bid on item ${itemId} is removed.`
    } else {
      const [itemId] = args
      item = itemId
      const order = bids.has(itemId) ? ranked(bids.get(itemId)) : []
      result = order.length ? order[0][0] : -1
      phase = 'query'
      message = `Highest bidder for item ${itemId}: ${result}.`
    }
    results.push(result)
    frames.push({ pythonLine: P(pythonMarker(name)), phase, activeLine: C(codeMarker(name)), at: k, item, op: name, result, results: [...results],
      bids: bids.has(item) ? ranked(bids.get(item)) : [], message })
  })
  frames.push({ pythonLine: P('return best[1]'), phase: 'done', activeLine: C('return -1'), at: -1, item: null, op: '', result: null, results: [...results], bids: [], message: 'All operations processed.' })
  return { input: { ops }, result: results, frames }
}

export function solve(ops) {
  return buildTrace({ ops }).result
}

function pythonMarker(name) {
  return { addBid: 'setdefault', updateBid: 'self.bids[item][user] = amount', removeBid: 'del self', getHighestBidder: 'for user, amount' }[name]
}

function codeMarker(name) {
  return { addBid: 'store the amount', updateBid: 'store the amount', removeBid: 'deletes the user', getHighestBidder: 'scans the item' }[name]
}

export const code = `run the auction operations in order
  keep for each item a map from user to bid amount
  addBid and updateBid store the amount for that user and item
  removeBid deletes the user's bid on that item
  getHighestBidder scans the item's bids for the largest amount, then the largest user id
  return -1 when the item has no bids`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `class AuctionSystem:
    def __init__(self):
        self.bids = {}

    def add_bid(self, user, item, amount):
        self.bids.setdefault(item, {})[user] = amount

    def update_bid(self, user, item, amount):
        self.bids[item][user] = amount

    def remove_bid(self, user, item):
        del self.bids[item][user]

    def get_highest_bidder(self, item):
        best = None
        for user, amount in self.bids.get(item, {}).items():
            if best is None or (amount, user) > best:
                best = (amount, user)
        return best[1] if best else -1
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
