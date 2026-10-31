export function parseInput(text) {
  const cards = JSON.parse(text)
  if (!Array.isArray(cards) || cards.length !== 4 || cards.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Enter four JSON integers from 1 to 9.')
  return cards
}

const EPS = 1e-6

// Repeatedly combine any two numbers with +, −, ×, ÷ (both orders for − and ÷); succeed at one value of 24.
export function buildTrace(cards) {
  const frames = [{ phase: 'start', pythonLine: 18, values: cards.map(String), attempt: null, found: null, activeLine: L('start with the four cards'), message: `Combine the four cards ${cards.join(', ')} into 24.` }]
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
        frames.push({ phase: 'try', pythonLine: 15, values: next.map(x => x.expr), attempt: expr, found: null, activeLine: L('put the result back'), message: `Try ${expr} = ${Number(value.toFixed(4))}.` })
        solve(next)
      }
    }
  }
  solve(cards.map(v => ({ expr: String(v), value: v })))
  frames.push({ phase: 'done', pythonLine: answer ? 16 : 17, values: [], attempt: null, found: answer, attempts, result: answer !== null, activeLine: answer ? L('if that reaches 24') : L('return false'), message: answer ? `Found: ${answer} = 24.` : 'No combination reaches 24.' })
  return { input: cards, result: answer !== null, expression: answer, frames }
}

export const code = `start with the four cards as the list of numbers
if one number is left, return whether it equals 24
for each pair of numbers in the list
  remove the pair from the list
  for each result of combining the pair with +, −, ×, ÷ (both orders for − and ÷)
    put the result back into the list and try to reach 24 from it
    if that reaches 24, return true
return false`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def judge_point_24(cards):
    def solve(nums):
        if len(nums) == 1:
            return abs(nums[0] - 24) < 1e-6
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                a, b = nums[i], nums[j]
                rest = [nums[k] for k in range(len(nums)) if k != i and k != j]
                options = [a + b, a - b, b - a, a * b]
                if abs(b) > 1e-6:
                    options.append(a / b)
                if abs(a) > 1e-6:
                    options.append(b / a)
                for value in options:
                    if solve(rest + [value]):
                        return True
        return False
    return solve([float(card) for card in cards])
`
