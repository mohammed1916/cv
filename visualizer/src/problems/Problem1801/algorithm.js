const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with orders (an array).')
  const { orders } = data
  if (!Array.isArray(orders) || orders.length < 1 || orders.length > 8) throw new Error('orders needs 1 to 8 entries.')
  for (const order of orders) {
    if (!Array.isArray(order) || order.length !== 3) throw new Error('Each order is [price, amount, type].')
    const [price, amount, type] = order
    if (!Number.isInteger(price) || price < 1 || price > 1000000000) throw new Error('Each price is an integer from 1 to 1000000000.')
    if (!Number.isInteger(amount) || amount < 1 || amount > 1000000000) throw new Error('Each amount is an integer from 1 to 1000000000.')
    if (type !== 0 && type !== 1) throw new Error('Each type is 0 for a buy or 1 for a sell.')
  }
  return { orders }
}

// A binary heap; `before(a, b)` is true when a belongs nearer the root.
class Heap {
  constructor(before) { this.a = []; this.before = before }
  get size() { return this.a.length }
  peek() { return this.a[0] }
  push(x) {
    const a = this.a
    a.push(x)
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (!this.before(a[i], a[p])) break
      ;[a[i], a[p]] = [a[p], a[i]]
      i = p
    }
  }
  pop() {
    const a = this.a
    const top = a[0]
    const last = a.pop()
    if (a.length) {
      a[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1, r = l + 1
        let best = i
        if (l < a.length && this.before(a[l], a[best])) best = l
        if (r < a.length && this.before(a[r], a[best])) best = r
        if (best === i) break
        ;[a[i], a[best]] = [a[best], a[i]]
        i = best
      }
    }
    return top
  }
}

export function buildTrace({ orders }) {
  const buy = new Heap((x, y) => x.price > y.price)
  const sell = new Heap((x, y) => x.price < y.price)
  const frames = [{ phase: 'start', activeLine: L('set buy to an empty max heap'), step: 0, buy: [], sell: [], message: 'Start with empty backlogs of buys and sells.' }]
  orders.forEach(([price, amount, type], index) => {
    let left = amount
    const kind = type === 0 ? 'buy' : 'sell'
    if (type === 0) {
      while (left > 0 && sell.size && sell.peek().price <= price) {
        const top = sell.peek()
        const take = Math.min(left, top.amount)
        left -= take
        top.amount -= take
        if (top.amount === 0) sell.pop()
      }
      if (left > 0) buy.push({ price, amount: left })
    } else {
      while (left > 0 && buy.size && buy.peek().price >= price) {
        const top = buy.peek()
        const take = Math.min(left, top.amount)
        left -= take
        top.amount -= take
        if (top.amount === 0) buy.pop()
      }
      if (left > 0) sell.push({ price, amount: left })
    }
    frames.push({ phase: 'order', activeLine: L(type === 0 ? 'trade against the cheapest sell' : 'trade against the highest buy'), step: index + 1, buy: [...buy.a], sell: [...sell.a], message: `Order ${index + 1}: ${kind} ${amount} at ${price}. ${left > 0 ? `${left} remains in the backlog.` : 'Fully matched.'}` })
  })
  const total = [...buy.a, ...sell.a].reduce((sum, e) => sum + e.amount, 0)
  const result = total % MOD
  frames.push({ phase: 'done', activeLine: L('return the sum modulo'), step: orders.length, buy: [...buy.a], sell: [...sell.a], message: `Backlog total ${total}, modulo ${MOD} is ${result}.` })
  return { input: { orders }, result, frames }
}

export const code = `number of orders left in the backlog modulo 1000000007
  set buy to an empty max heap by price and sell to an empty min heap by price
  for each order in sequence
    set left to the order amount
    if the order is a buy then
      while left is positive and the cheapest sell is at most the buy price
        trade against the cheapest sell
      if left is positive then
        add the buy to the buy heap with amount left
    otherwise
      while left is positive and the highest buy is at least the sell price
        trade against the highest buy
      if left is positive then
        add the sell to the sell heap with amount left
  sum the amounts in both heaps
  return the sum modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_backlog(orders):
    import heapq

    MOD = 1000000007
    buy = []
    sell = []
    for price, amount, kind in orders:
        left = amount
        if kind == 0:
            while left > 0 and sell and sell[0][0] <= price:
                take = min(left, sell[0][1])
                left -= take
                sell[0][1] -= take
                if sell[0][1] == 0:
                    heapq.heappop(sell)
            if left > 0:
                heapq.heappush(buy, [-price, left])
        else:
            while left > 0 and buy and -buy[0][0] >= price:
                take = min(left, buy[0][1])
                left -= take
                buy[0][1] -= take
                if buy[0][1] == 0:
                    heapq.heappop(buy)
            if left > 0:
                heapq.heappush(sell, [price, left])
    total = sum(entry[1] for entry in buy) + sum(entry[1] for entry in sell)
    return total % MOD
`
