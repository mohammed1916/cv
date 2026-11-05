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
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('const totalLoss ='), index: -1, totalLoss, best, message: `Losses add up to ${totalLoss} if every transaction is paid for.` }]
  transactions.forEach(([cost, cashback], i) => {
    const candidate = totalLoss - loss([cost, cashback]) + cost
    best = Math.max(best, candidate)
    frames.push({ phase: 'candidate', pythonLine: 6, activeLine: L('best = Math.max'), index: i, totalLoss, candidate, best, message: `If transaction ${i} comes last, the money needed is ${candidate}; best ${best}.` })
  })
  frames.push({ phase: 'done', pythonLine: 7, activeLine: L('return best'), index: -1, totalLoss, best, message: `Minimum money required: ${best}.` })
  return { input, result: best, frames }
}

export const code = `function minimumMoneyRequired(transactions) {
  const totalLoss = transactions.reduce((sum, [cost, cashback]) => sum + Math.max(0, cost - cashback), 0)
  let best = 0
  for (const [cost, cashback] of transactions) {
    const loss = Math.max(0, cost - cashback)
    best = Math.max(best, totalLoss - loss + cost) // this transaction comes last
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def minimum_money_required(transactions):
    total_loss = sum(max(0, cost - cashback) for cost, cashback in transactions)
    best = 0
    for cost, cashback in transactions:
        loss = max(0, cost - cashback)
        best = max(best, total_loss - loss + cost)
    return best
`
