export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys n and requests.')
  const { n, requests } = input
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('n must be an integer from 1 to 6.')
  if (!Array.isArray(requests) || requests.length < 1 || requests.length > 8) throw new Error('requests needs 1 to 8 [from, to] pairs.')
  requests.forEach((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(v => !Number.isInteger(v) || v < 0 || v >= n)) {
      throw new Error(`requests[${i}] must be two buildings from 0 to n-1.`)
    }
  })
  return { n, requests }
}

export function buildTrace(input) {
  const { n, requests } = input
  const m = requests.length
  const balance = Array(n).fill(0)
  const frames = []
  let best = 0
  let depthTaken = 0
  let at = -1
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, at, taken: depthTaken, balance: [...balance], best, message,
  })

  const search = (i, taken) => {
    depthTaken = taken
    at = i
    if (i === m) {
      const balanced = balance.every(b => b === 0)
      snap('check', L('if every balance is zero'), balanced ? `All balances are zero with ${taken} granted. Best is ${Math.max(best, taken)}.` : `Some building is unbalanced with ${taken} granted.`)
      if (balanced && taken > best) best = taken
      return
    }
    const [from, to] = requests[i]
    balance[from]--
    balance[to]++
    snap('take', L('take the request'), `Grant request ${i} (${from} to ${to}).`)
    search(i + 1, taken + 1)
    balance[from]++
    balance[to]--
    snap('undo', L('undo the take'), `Undo request ${i}.`)
    snap('skip', L('skip the request'), `Refuse request ${i} and continue.`)
    search(i + 1, taken)
  }

  snap('start', L('set best to zero'), 'Start with best at zero and every balance at zero.')
  search(0, 0)
  at = -1
  snap('done', L('return best'), `Maximum achievable requests: ${best}.`)
  return { input, result: best, frames }
}

export const code = `set best to zero and the balance of every building to zero
define a search that takes the request number i and a count of granted requests
  if i is past the last request
    if every balance is zero, update best with the count
    return
  take the request: its source building loses one and its target gains one
  search with i plus one and the count plus one
  undo the take
  skip the request
  search with i plus one and the same count
start the search at request 0 with a count of zero
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_achievable(n, requests):
    m = len(requests)
    balance = [0] * n
    best = 0

    def search(i, taken):
        nonlocal best
        if i == m:
            if all(b == 0 for b in balance):
                best = max(best, taken)
            return
        a, b = requests[i]
        balance[a] -= 1
        balance[b] += 1
        search(i + 1, taken + 1)
        balance[a] += 1
        balance[b] -= 1
        search(i + 1, taken)

    search(0, 0)
    return best
`
