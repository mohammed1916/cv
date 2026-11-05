export function parseInput(text) {
  const cards = JSON.parse(text)
  if (!Array.isArray(cards) || cards.length !== 4 || cards.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Enter four JSON integers from 1 to 9.')
  return cards
}

const EPS = 1e-6

// Any expression over four numbers combines two of them first. So repeatedly pick a pair, apply each operator
// (both orders for − and ÷), and recurse on the shorter list. Reaching one value close to 24 succeeds.
export function buildTrace(cards) {
  const frames = [{ phase: 'start', pool: [...cards], combine: null, depth: 0, found: false, activeLine: L('const solve = nums'), pythonLine: P('for i in range'), message: `Start with ${cards.join(', ')}. Combine any two numbers, then repeat.` }]
  let found = false
  const solve = (pool, depth, path) => {
    if (pool.length === 1) {
      const ok = Math.abs(pool[0] - 24) < EPS
      frames.push({ phase: 'check', pool: [...pool], combine: path.join(' → ') || null, depth, found: ok, activeLine: L('return Math.abs'), pythonLine: P('return abs'), message: `One number left: ${pool[0].toFixed(3)}, ${ok ? 'which is 24.' : 'not 24.'}` })
      return ok
    }
    for (let i = 0; i < pool.length; i++) {
      for (let j = 0; j < pool.length; j++) {
        if (i === j) continue
        const a = pool[i], b = pool[j]
        const rest = pool.filter((_, k) => k !== i && k !== j)
        const options = [['+', a + b], ['−', a - b], ['×', a * b]]
        if (Math.abs(b) > EPS) options.push(['÷', a / b])
        for (const [op, value] of options) {
          const step = `${a} ${op} ${b} = ${round(value)}`
          frames.push({ phase: 'combine', pool: [...pool], combine: step, depth, found: false, activeLine: L('for (const value of options)'), pythonLine: P('for value in options'), message: `Try ${step}: the list becomes ${[...rest, value].map(round).join(', ')}.` })
          if (solve([...rest, value], depth + 1, [...path, step])) return true
        }
      }
    }
    return false
  }
  found = solve([...cards], 0, [])
  frames.push({ phase: 'done', pool: [...cards], combine: null, depth: 0, found, result: found, activeLine: L('return false'), pythonLine: P('return False'), message: found ? '24 can be reached.' : 'No way combines these numbers to 24.' })
  return { input: cards, result: found, frames }
}

function round(value) {
  return Math.round(value * 1000) / 1000
}

const SOURCE = `function judgePoint24(cards) {
  const EPS = 1e-6
  const solve = nums => {
    if (nums.length === 1) return Math.abs(nums[0] - 24) < EPS
    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length; j++) {
        if (i === j) continue
        const a = nums[i]
        const b = nums[j]
        const rest = nums.filter((_, k) => k !== i && k !== j)
        const options = [a + b, a - b, a * b]
        if (Math.abs(b) > EPS) options.push(a / b)
        for (const value of options) {
          if (solve([...rest, value])) return true
        }
      }
    }
    return false
  }
  return solve(cards)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def judge_point_24(cards):
    EPS = 1e-6

    def solve(nums):
        if len(nums) == 1:
            return abs(nums[0] - 24) < EPS
        for i in range(len(nums)):
            for j in range(len(nums)):
                if i == j:
                    continue
                a, b = nums[i], nums[j]
                rest = [nums[k] for k in range(len(nums)) if k != i and k != j]
                options = [a + b, a - b, a * b]
                if abs(b) > EPS:
                    options.append(a / b)
                for value in options:
                    if solve(rest + [value]):
                        return True
        return False

    return solve(list(cards))`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
