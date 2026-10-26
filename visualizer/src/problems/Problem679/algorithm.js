export function parseInput(text) {
  const cards = JSON.parse(text)
  if (!Array.isArray(cards) || cards.length !== 4 || cards.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Enter four JSON integers from 1 to 9.')
  return cards
}

const EPS = 1e-6

// Repeatedly combine any two numbers with +, −, ×, ÷ (both orders for − and ÷); succeed at one value of 24.
export function buildTrace(cards) {
  const frames = [{ phase: 'start', values: cards.map(String), attempt: null, found: null, activeLine: 2, message: `Combine the four cards ${cards.join(', ')} into 24.` }]
  let answer = null
  let attempts = 0
  function solve(items) {
    if (answer) return
    if (items.length === 1) {
      if (Math.abs(items[0].value - 24) < EPS) answer = items[0].expr
      return
    }
    for (let i = 0; i < items.length && !answer; i++) for (let j = i + 1; j < items.length && !answer; j++) {
      const a = items[i], b = items[j]
      const rest = items.filter((_, k) => k !== i && k !== j)
      const options = [
        [`(${a.expr} + ${b.expr})`, a.value + b.value],
        [`(${a.expr} − ${b.expr})`, a.value - b.value],
        [`(${b.expr} − ${a.expr})`, b.value - a.value],
        [`(${a.expr} × ${b.expr})`, a.value * b.value],
      ]
      if (Math.abs(b.value) > EPS) options.push([`(${a.expr} ÷ ${b.expr})`, a.value / b.value])
      if (Math.abs(a.value) > EPS) options.push([`(${b.expr} ÷ ${a.expr})`, b.value / a.value])
      for (const [expr, value] of options) {
        if (answer) return
        attempts++
        const next = [...rest, { expr, value }]
        frames.push({ phase: 'try', values: next.map(x => x.expr), attempt: expr, found: null, activeLine: 6, message: `Try ${expr} = ${Number(value.toFixed(4))}.` })
        solve(next)
      }
    }
  }
  solve(cards.map(v => ({ expr: String(v), value: v })))
  frames.push({ phase: 'done', values: [], attempt: null, found: answer, attempts, result: answer !== null, activeLine: 9, message: answer ? `Found: ${answer} = 24.` : 'No combination reaches 24.' })
  return { input: cards, result: answer !== null, expression: answer, frames }
}

export const code = `def judgePoint24(cards):
    def solve(nums):
        if len(nums) == 1: return abs(nums[0] - 24) < 1e-6
        for i, j in pairs(nums):
            rest = others(nums, i, j)
            for v in combine(nums[i], nums[j]):
                if solve(rest + [v]): return True
        return False
    return solve([float(c) for c in cards])`.split('\n').map((text, index) => ({ line: index + 1, text }))
