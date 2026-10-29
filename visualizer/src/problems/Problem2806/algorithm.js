export const code = [
  { line: 1, text: "shifted = purchaseAmount + 5" },
  { line: 2, text: "rounded = shifted // 10 * 10" },
  { line: 3, text: "return 100 - rounded" },
]

export const python = `def accountBalanceAfterPurchase(purchaseAmount):
    shifted = purchaseAmount + 5
    rounded = shifted // 10 * 10
    return 100 - rounded`

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.purchaseAmount)) throw new Error('Use an object with an integer purchaseAmount, for example {"purchaseAmount":9}.')
  if (data.purchaseAmount < 0 || data.purchaseAmount > 100) throw new Error('purchaseAmount must be an integer from 0 to 100.')
  return { purchaseAmount: data.purchaseAmount }
}

export function buildTrace({ purchaseAmount }) {
  const frames = []
  const shifted = purchaseAmount + 5
  frames.push({ phase: 'shift', activeLine: 1, pythonLine: 2, purchase: purchaseAmount, shifted, rounded: null, message: `Add 5 to ${purchaseAmount}, giving ${shifted}, so that a tie rounds up.` })
  const rounded = Math.floor(shifted / 10) * 10
  frames.push({ phase: 'round', activeLine: 2, pythonLine: 3, purchase: purchaseAmount, shifted, rounded, message: `Round down to the multiple of 10: ${rounded}.` })
  const balance = 100 - rounded
  frames.push({ phase: 'done', activeLine: 3, pythonLine: 4, purchase: purchaseAmount, shifted, rounded, result: balance, message: `Balance is 100 - ${rounded} = ${balance}.` })
  return { input: { purchaseAmount }, result: balance, frames }
}
