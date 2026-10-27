export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 10) throw new Error('Use an array of 1 to 10 integers.')
  if (arr.some(v => !Number.isInteger(v) || v < 2 || v > 1000)) throw new Error('Values are integers from 2 to 1000.')
  return arr
}

export const code = `count distinct primes that divide the product of nums
  let found be an empty set of primes
  for each value v in nums
  let d be 2
  while d times d is at most v
  if d divides v then add d to found and divide v by d while it still divides
  otherwise increase d by one
  if v is greater than one then add v to found
  return the size of found`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(arr) {
  const found = new Set()
  const frames = [{ phase: 'start', activeLine: L('let found be'), index: -1, found: [], message: 'Collect prime factors of every element into one set.' }]
  arr.forEach((value, index) => {
    let v = value
    frames.push({ phase: 'value', activeLine: L('for each value'), index, found: [...found], message: `Factor ${value}.` })
    for (let d = 2; d * d <= v; ) {
      if (v % d === 0) {
        found.add(d)
        while (v % d === 0) v /= d
        frames.push({ phase: 'factor', activeLine: L('if d divides v'), index, found: [...found], message: `${d} divides ${value}; it is now in the set.` })
      } else {
        d += 1
        frames.push({ phase: 'try', activeLine: L('otherwise increase d'), index, found: [...found], message: `Try the next divisor, ${d}.` })
      }
    }
    if (v > 1) {
      found.add(v)
      frames.push({ phase: 'factor', activeLine: L('if v is greater'), index, found: [...found], message: `${v} is a prime factor of ${value}.` })
    }
  })
  const result = found.size
  frames.push({ phase: 'done', activeLine: L('return the size of found'), index: -1, found: [...found].sort((a, b) => a - b), message: `The product has ${result} distinct prime factor(s).` })
  return { input: arr, result, frames }
}

export const python = `def distinct_prime_factors(nums):
    found = set()
    for value in nums:
        v = value
        d = 2
        while d * d <= v:
            if v % d == 0:
                found.add(d)
                while v % d == 0:
                    v //= d
            else:
                d += 1
        if v > 1:
            found.add(v)
    return len(found)
`
