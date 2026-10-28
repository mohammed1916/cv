const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with complexity, for example {"complexity":[1,2,3]}.')
  const { complexity } = data
  if (!Array.isArray(complexity) || complexity.length < 2 || complexity.length > 7) throw new Error('complexity must have 2 to 7 entries.')
  if (complexity.some(c => !Number.isInteger(c) || c < 1 || c > 20)) throw new Error('Each complexity is an integer from 1 to 20.')
  return { complexity: [...complexity] }
}

export function buildTrace(input) {
  const { complexity } = input
  const n = complexity.length
  const frames = [{ phase: 'start', activeLine: L('set the answer to 1'), index: 0, message: 'Computer 0 starts unlocked. Every other computer needs an earlier, weaker unlocked computer.' }]
  let blocked = -1
  for (let i = 1; i < n; i++) {
    if (complexity[i] <= complexity[0]) { blocked = i; break }
    frames.push({ phase: 'check', activeLine: L('if complexity[i] is at most complexity[0]'), index: i, message: `Computer ${i} has complexity ${complexity[i]}, above computer 0's ${complexity[0]}, so computer 0 can unlock it.` })
  }
  if (blocked !== -1) {
    frames.push({ phase: 'done', activeLine: L('return 0'), index: blocked, message: `Computer ${blocked} has complexity ${complexity[blocked]}, which is not above computer 0's ${complexity[0]}, so no order unlocks everything.` })
    return { input, result: 0, frames }
  }
  let result = 1
  for (let k = 2; k < n; k++) result = (result * k) % MOD
  frames.push({ phase: 'done', activeLine: L('return the answer'), index: n - 1, message: `Every computer after 0 can be unlocked by 0, so each order starting at 0 works. The count is ${n - 1} factorial, which is ${result} modulo 1000000007.` })
  return { input, result, frames }
}

export const code = `count unlocking permutations (complexity)
  let n be the length of complexity
  for each computer i from 1 to n - 1
    if complexity[i] is at most complexity[0] then return 0
  set the answer to 1
  for k from 2 to n - 1
    multiply the answer by k, modulo 1000000007
  return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_unlock_orders(complexity):
    MOD = 10 ** 9 + 7
    n = len(complexity)
    for i in range(1, n):
        if complexity[i] <= complexity[0]:
            return 0
    result = 1
    for k in range(2, n):
        result = result * k % MOD
    return result
`
