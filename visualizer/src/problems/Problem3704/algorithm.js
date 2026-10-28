export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 2 || n > 1000000) throw new Error('Use an integer n from 2 to 1000000.')
  return n
}

// Each addend is a state: still running (has digits to place) or finished (only zeros remain).
// The first digit place must be non-zero for both addends, so neither can finish there.
function optionsFor(running, position) {
  if (!running) return [[0, false]]
  const choices = []
  for (let d = 1; d <= 9; d++) choices.push([d, true])
  if (position > 0) choices.push([0, false])
  return choices
}

export function buildTrace(n) {
  const digits = String(n).split('').reverse().map(Number)
  let states = new Map([['0,1,1', 1]])
  const frames = [{ phase: 'start', activeLine: L('start with one state'), position: -1, digit: null, states: 1, total: null, message: `Both addends must have at least one digit. The digits of n from the ones place: ${digits.join(' ')}.` }]
  digits.forEach((digit, position) => {
    const next = new Map()
    for (const [key, count] of states) {
      const [carry, runA, runB] = key.split(',').map(Number)
      for (const [da, keepA] of optionsFor(runA === 1, position)) {
        for (const [db, keepB] of optionsFor(runB === 1, position)) {
          const sum = da + db + carry
          if (sum % 10 !== digit) continue
          const nextKey = `${Math.floor(sum / 10)},${keepA ? 1 : 0},${keepB ? 1 : 0}`
          next.set(nextKey, (next.get(nextKey) || 0) + count)
        }
      }
    }
    states = next
    frames.push({ phase: 'digit', activeLine: L('keep the choices where the sum mod 10 equals'), position, digit, states: states.size, total: null, message: `Digit ${digit} at place ${position}: ${states.size} live states remain.` })
  })
  let total = 0
  for (const [key, count] of states) if (key.startsWith('0,')) total += count
  frames.push({ phase: 'done', activeLine: L('return the count of states with carry 0'), position: -1, digit: null, states: states.size, total, message: `Pairs with no zero digits: ${total}.` })
  return { input: n, result: total, frames }
}

export const code = `count no-zero pairs that sum to n
  split n into digits from the ones place up
  start with one state where the carry is 0 and both addends are running
  for each digit d of n from the ones place up
    for each state
      choose a digit for each running addend (1 to 9, or stop with 0 after the first place)
      keep the choices where the sum mod 10 equals d
      record the new carry and which addends are still running
  return the count of states with carry 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_no_zero_pairs(n):
    digits = [int(ch) for ch in reversed(str(n))]
    states = {(0, True, True): 1}
    for i, d in enumerate(digits):
        nxt = {}
        for (carry, run_a, run_b), count in states.items():
            opts_a = ([(x, True) for x in range(1, 10)] + ([(0, False)] if i > 0 else [])) if run_a else [(0, False)]
            opts_b = ([(x, True) for x in range(1, 10)] + ([(0, False)] if i > 0 else [])) if run_b else [(0, False)]
            for da, keep_a in opts_a:
                for db, keep_b in opts_b:
                    s = da + db + carry
                    if s % 10 != d:
                        continue
                    key = (s // 10, keep_a, keep_b)
                    nxt[key] = nxt.get(key, 0) + count
        states = nxt
    return sum(count for (carry, _, _), count in states.items() if carry == 0)
`
