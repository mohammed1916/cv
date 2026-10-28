export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with a transactions key.')
  const { transactions } = input
  if (!Array.isArray(transactions) || transactions.length < 1 || transactions.length > 8) throw new Error('transactions needs 1 to 8 pairs.')
  if (transactions.some(t => !Array.isArray(t) || t.length !== 2 || !t.every(Number.isInteger) || t[0] < 1 || t[0] > 20 || t[1] < 0 || t[1] > 20)) {
    throw new Error('Each transaction is [cost, cashback] with cost 1 to 20 and cashback 0 to 20.')
  }
  return { transactions }
}

export function buildTrace(input) {
  const { transactions } = input
  const loss = ([cost, cashback]) => Math.max(0, cost - cashback)
  const totalLoss = transactions.reduce((sum, t) => sum + loss(t), 0)
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('set total loss'), index: -1, totalLoss, best, message: `Losses add up to ${totalLoss} if every transaction is paid for.` }]
  transactions.forEach(([cost, cashback], i) => {
    const candidate = totalLoss - loss([cost, cashback]) + cost
    best = Math.max(best, candidate)
    frames.push({ phase: 'candidate', activeLine: L('set best to the larger'), index: i, totalLoss, candidate, best, message: `If transaction ${i} comes last, the money needed is ${candidate}; best ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, totalLoss, best, message: `Minimum money required: ${best}.` })
  return { input, result: best, frames }
}

export const code = `minimum money that completes every transaction in any order:
  set total loss to the sum of max(0, cost minus cashback) over all transactions
  set best to 0
  for each transaction [cost, cashback]
    set loss to max(0, cost minus cashback)
    set best to the larger of best and total loss minus loss plus cost
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_money_required(transactions):
    total_loss = sum(max(0, cost - cashback) for cost, cashback in transactions)
    best = 0
    for cost, cashback in transactions:
        loss = max(0, cost - cashback)
        best = max(best, total_loss - loss + cost)
    return best
`
