export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || ![data.l, data.r, data.k].every(Number.isInteger)) throw new Error('Use {"l": l, "r": r, "k": k} with integers.')
  const { l, r, k } = data
  if (l < 0 || r < l || r > 200) throw new Error('Need 0 <= l <= r <= 200 for the visualization.')
  if (k < 1 || k > 30) throw new Error('k is an integer from 1 to 30.')
  return { l, r, k }
}

export function buildTrace(input) {
  const { l, r, k } = input
  const frames = [{ phase: 'start', activeLine: L('if k is 1'), x: null, power: null, count: 0, result: null, message: `Count the powers x^${k} that fall in [${l}, ${r}].` }]
  if (k === 1) {
    const result = r - l + 1
    frames.push({ phase: 'one', activeLine: L('return r minus l'), x: null, power: null, count: result, result, message: `With k = 1 every integer is a power, so the answer is ${r} - ${l} + 1 = ${result}.` })
    return { input, result, frames }
  }
  let count = 0
  let x = 0
  while (Math.pow(x, k) <= r) {
    const power = Math.pow(x, k)
    if (power >= l) {
      count++
      frames.push({ phase: 'hit', activeLine: L('add 1 to count'), x, power, count, result: null, message: `${x}^${k} = ${power} is in range, so count it. Count ${count}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('while x to the power'), x, power, count, result: null, message: `${x}^${k} = ${power} is below ${l}.` })
    }
    x++
  }
  frames.push({ phase: 'done', activeLine: L('return count'), x: null, power: null, count, result: count, message: `Perfect ${k}-th powers in range: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count perfect k-th powers in the range
  if k is 1 then
    return r minus l plus 1
  let count be 0
  let x be 0
  while x to the power k is at most r
    if x to the power k is at least l then
      add 1 to count
    add 1 to x
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_k_th_roots_in_range(l, r, k):
    if k == 1:
        return r - l + 1
    count = 0
    x = 0
    while x ** k <= r:
        if x ** k >= l:
            count += 1
        x += 1
    return count
`
