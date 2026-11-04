const NAMES = ['addOrder', 'modifyOrder', 'cancelOrder', 'getOrdersAtPrice']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.ops)) throw new Error('Use an object with an ops list.')
  if (input.ops.length < 1 || input.ops.length > 12) throw new Error('ops has 1 to 12 operations.')
  for (const op of input.ops) {
    if (!Array.isArray(op) || !NAMES.includes(op[0])) throw new Error('Each operation is addOrder, modifyOrder, cancelOrder or getOrdersAtPrice.')
    if (op[0] === 'addOrder') {
      if (op.length !== 4 || !Number.isInteger(op[1]) || !['buy', 'sell'].includes(op[2]) || !Number.isInteger(op[3])) throw new Error('addOrder takes an id, buy or sell, and a price.')
    } else if (op[0] === 'modifyOrder') {
      if (op.length !== 3 || !Number.isInteger(op[1]) || !Number.isInteger(op[2])) throw new Error('modifyOrder takes an id and a new price.')
    } else if (op[0] === 'cancelOrder') {
      if (op.length !== 2 || !Number.isInteger(op[1])) throw new Error('cancelOrder takes an id.')
    } else if (op.length !== 3 || !['buy', 'sell'].includes(op[1]) || !Number.isInteger(op[2])) throw new Error('getOrdersAtPrice takes buy or sell and a price.')
  }
  return { ops: input.ops }
}

export function buildTrace({ ops }) {
  const orders = new Map()
  const frames = []
  const results = []
  ops.forEach((op, k) => {
    const [name, ...args] = op
    let result = null
    let phase
    let message
    if (name === 'addOrder') {
      const [id, type, price] = args
      if (orders.has(id)) throw new Error(`addOrder needs an unused id; ${id} was already used.`)
      orders.set(id, { type, price, active: true })
      phase = 'add'
      message = `Order ${id} (${type} at ${price}) is active.`
    } else if (name === 'modifyOrder') {
      const [id, price] = args
      const order = orders.get(id)
      if (!order || !order.active) throw new Error(`modifyOrder needs an active order ${id}.`)
      order.price = price
      phase = 'modify'
      message = `Order ${id} moves to price ${price}.`
    } else if (name === 'cancelOrder') {
      const [id] = args
      const order = orders.get(id)
      if (!order || !order.active) throw new Error(`cancelOrder needs an active order ${id}.`)
      order.active = false
      phase = 'cancel'
      message = `Order ${id} is cancelled.`
    } else {
      const [type, price] = args
      result = [...orders.entries()].filter(([, o]) => o.active && o.type === type && o.price === price).map(([id]) => id).sort((a, b) => a - b)
      phase = 'query'
      message = `${type} orders at ${price}: ${result.length ? result.join(', ') : 'none'}.`
    }
    results.push(result)
    frames.push({ pythonLine: P(pythonMarker(name)), phase, activeLine: C(codeMarker(name)), at: k, op: name, result, results: [...results],
      active: [...orders.entries()].filter(([, o]) => o.active).map(([id, o]) => [id, o.type, o.price]), message })
  })
  frames.push({ pythonLine: P('return ids'), phase: 'done', activeLine: C('return the list'), at: -1, op: '', result: null, results: [...results],
    active: [...orders.entries()].filter(([, o]) => o.active).map(([id, o]) => [id, o.type, o.price]), message: 'All operations processed.' })
  return { input: { ops }, result: results, frames }
}

export function solve(ops) {
  return buildTrace({ ops }).result
}

function pythonMarker(name) {
  return { addOrder: 'self.orders[order_id] =', modifyOrder: 'order[1] = new_price', cancelOrder: 'order[2] = False', getOrdersAtPrice: 'return ids' }[name]
}

function codeMarker(name) {
  return { addOrder: 'records the order', modifyOrder: 'changes the price', cancelOrder: 'marks the order inactive', getOrdersAtPrice: 'collects the active' }[name]
}

export const code = `function orderManagementSystem(ops) {
  // run the order operations in order, keeping every order by id
  const orders = new Map()
  const results = []
  for (const [name, ...args] of ops) {
    if (name === 'addOrder') {
      const [id, side, price] = args
      // records the order as active
      orders.set(id, { side, price, active: true })
    } else if (name === 'modifyOrder') {
      const [id, newPrice] = args
      // changes the price of an active order
      orders.get(id).price = newPrice
    } else if (name === 'cancelOrder') {
      const [id] = args
      // marks the order inactive instead of deleting it
      orders.get(id).active = false
    } else {
      const [side, price] = args
      // collects the active orders with that side and price
      results.push([...orders].filter(([, o]) => o.active && o.side === side && o.price === price).map(([id]) => id))
    }
  }
  // return the list of answers
  return results
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class OrderManagementSystem:
    def __init__(self):
        self.orders = {}

    def add_order(self, order_id, side, price):
        self.orders[order_id] = [side, price, True]

    def modify_order(self, order_id, new_price):
        order = self.orders[order_id]
        order[1] = new_price

    def cancel_order(self, order_id):
        order = self.orders[order_id]
        order[2] = False

    def get_orders_at_price(self, side, price):
        ids = [oid for oid, (s, p, live) in self.orders.items() if live and s == side and p == price]
        return ids
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
